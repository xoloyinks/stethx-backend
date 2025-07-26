import mongoose from "mongoose";
import autopopulate from "mongoose-autopopulate";

const predictionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, gender: {
        type: String,
        required: true
    }, age: {
        type: String
    }, HbA1c_level: {
        type: String
    }, smoking_history: {
        type: String
    }, heart_disease: {
        type: Boolean
    }, hypertension: {
        type: Boolean
    }, blood_glucose_level: {
        type: String
    }, bmi: {
        type: String
    }, prediction: {
        type: String
    }, decision_support: {
        type: String
    }, confidence: {
        type: String
    }, patient_id: {
        type: String,
        unique: true
    }, createdAt: {
        type: Date,
        default: Date.now,
    }


}, { collection: 'predictions' })

predictionSchema.plugin(autopopulate);

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;