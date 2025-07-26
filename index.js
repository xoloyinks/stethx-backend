import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import connectDb from './mongo.js';
import { hashText, comparePasswords } from './src/utils/bcrypting.js';
import User from './src/models/Admin.js';
import { jwtSign } from './src/utils/jwt.js';
import jwtMiddleware from './src/middlewares/check_user.js';
import Prediction from './src/models/Prediction.js';
import predictions from './src/services/get_predictions.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // In production, use specific origins instead of '*'
    const allowedOrigins = ['http://localhost:3000', "https://stethx.vercel.app"];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb', verify: rawBodySaver }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Middleware to capture raw body for Paystack signature verification
function rawBodySaver(req, res, buf) {
  if (buf && buf.length) {
    req.rawBody = buf.toString('utf8');
  }
}

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwtSign({ 
          id: user._id, email: user.email
    });

    // TODO: Implement JWT or session handling for secure authentication
    return res.status(200).json({ message: 'Login successful', data: { token } });
  } catch(error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error'});
  }
});

// Patient data for prediction
app.post('/prediction', jwtMiddleware, async(req, res) => {
    try{

        const { name, gender, age, HbA1c_level, smoking_history, heart_disease, hypertension, blood_glucose_level, bmi, prediction, decision_support, confidence } = req.body;

        const prefix = "PAT";
        const randomNum = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit number (10000-99999)
        const patientId = `${prefix}-${randomNum}`;

        const predictionData = {
            name: await hashText(name),
            gender: await hashText(gender),
            age: await hashText(age), 
            HbA1c_level: await hashText(HbA1c_level),
            smoking_history: await hashText(smoking_history),
            heart_disease,
            hypertension,
            blood_glucose_level: await hashText(blood_glucose_level),
            bmi: await hashText(bmi),
            prediction: await hashText(prediction),
            decision_support: await hashText(decision_support),
            confidence: await hashText(confidence),
            patient_id: patientId
        }

        const data = await Prediction.create(predictionData);

        if(!data){
            return res.status(400).json({ message: "Failed to save prediction" });
        }

        return res.status(200).json({ message: "Prediction saved" })

    }catch(err){
        return res.status(500).json({ message: "Internal server error!" })
    }
})

app.get('/history', jwtMiddleware, async( req, res ) => {
  try{
    const history = await Prediction.find({});
    if(!history){
      return res.status(404).json({ message: "Predictions not returned" })
    }


    const data = await Promise.all(
      history.map(async(his) => {
        return await predictions(his);
      })
    )

    return res.status(200).json({ message: "Prediction history retrieved!", data })

  }catch(err){
    return res.status(500).json({ message: "Internal server error!" })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
server.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
});