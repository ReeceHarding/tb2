import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Quiz data and personalized content storage
    quizData: {
      userType: {
        type: String,
        enum: [null, 'parents', 'schools', 'entrepreneur', 'government', 'philanthropist', 'developer', 'student'],
        default: null,
      },
      parentSubType: {
        type: String,
        enum: [null, 'timeback-school', 'homeschool', 'tutoring'],
        default: null,
      },
      schoolSubType: {
        type: String,
        enum: [null, 'private', 'public'],
        default: null,
      },
      grade: {
        type: String,
        enum: [null, 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
        default: null,
      },
      numberOfKids: {
        type: Number,
        default: 1,
        min: 1,
      },
      selectedSchools: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        level: { type: String, required: true },
      }],
      kidsInterests: [String],
      completedAt: {
        type: Date,
        default: null,
      },
    },
    // Generated personalized content from AI
    generatedContent: {
      afternoonActivities: { type: mongoose.Schema.Types.Mixed, default: null },
      subjectExamples: { type: mongoose.Schema.Types.Mixed, default: null },
      howWeGetResults: { type: mongoose.Schema.Types.Mixed, default: null },
      followUpQuestions: { type: mongoose.Schema.Types.Mixed, default: null },
      allCompleted: { type: Boolean, default: false },
      hasErrors: { type: Boolean, default: false },
      generatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
