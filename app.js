const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLEKEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
  const result = await model.generateContent([
    "What is in this photo?",
    {inlineData: {data: Buffer.from(fs.readFileSync('./imagem.png')).toString("base64"), 
    mimeType: 'image/png'}}]
  );
  console.log(result.response.text());
}
run();
      