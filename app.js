import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import multer from 'multer';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware CORS configurado para permitir credenciais
const corsOptions = {
  origin: 'http://localhost:3000/', // Ou a origem que você quer permitir
};

app.use(cors(corsOptions));
app.use(express.json()); // Para lidar com dados JSON no corpo da requisição

const genAI = new GoogleGenerativeAI(process.env.GOOGLEKEY);

// Rota para receber a imagem e o texto, processá-los e enviar para a AI
app.post("/ai", upload.single('image'), async (req, res) => {
  try {
    console.log(req.body);
    if (!req.body.text) {
      return res.status(400).send("Text is required");
    }
    if (!req.file) {
      return res.status(400).send("Image is required");
    }

    const data = req.body;
    const imagePath = req.file.path;
    const image = fs.readFileSync(imagePath);
    const base64Image = image.toString('base64');

    // Preparando o modelo e enviando a solicitação para a AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      `${data.text}`,
      { inlineData: { data: base64Image, mimeType: 'image/png' } }
    ]);

    // Enviando a resposta
    console.log(result.response.text())
    res.send(result.response.text());

  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

// Rota para verificação
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
