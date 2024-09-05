import { Hono } from "hono";
import type { Bindings } from "../../types";

import imageClassification from "./image-classification";
import imageToText from "./image-to-text";
import objectDetection from "./object-detection";
import speechRecognition from "./speech-recognition";
import summarization from "./summarization";
import textClassification from "./text-classification";
import textGeneration from "./text-generation";
import textToImage from "./text-to-image";
import translation from "./translation";

const app = new Hono<{
  Bindings: Bindings;
  Variables: {
    inputs: unknown;
  };
}>();

app.route("/text-generation", textGeneration);
app.route("/text-to-image", textToImage);
app.route("/image-to-text", imageToText);
app.route("/translation", translation);
app.route("/speech-recognition", speechRecognition);
app.route("/image-classification", imageClassification);
app.route("/object-detection", objectDetection);
app.route("/text-classification", textClassification);
app.route("/text-generation", textGeneration);
app.route("/summarization", summarization);

export default app;
