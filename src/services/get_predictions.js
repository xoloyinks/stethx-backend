import { decryptText } from "../utils/bcrypting.js";

async function predictions(data){
    if(!data) return;
    return {
            name: await decryptText(data.name),
            gender: await decryptText(data.gender),
            age: await decryptText(data.age), 
            HbA1c_level: await decryptText(data.HbA1c_level),
            smoking_history: await decryptText(data.smoking_history),
            heart_disease: data.heart_disease,
            hypertension: data.hypertension,
            blood_glucose_level: await decryptText(data.blood_glucose_level),
            bmi: await decryptText(data.bmi),
            prediction: await decryptText(data.prediction),
            decision_support: await decryptText(data.decision_support),
            confidence: await decryptText(data.confidence),
            patient_id: data.patient_id,
            createdAt: data.createdAt
    }
}

export default predictions;