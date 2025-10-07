const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const serviceAccount = require("../../etc/secrets/firebase-key.json");
const BUCKET = "imogoat-oficial-ab14c.appspot.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET
});

const bucket = admin.storage().bucket(BUCKET);

const uploadImovel = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const uploadPromises = req.files.map(async (image) => {
      const nomeArquivo = `imoveis/${uuidv4()}.${image.originalname.split(".").pop()}`;
      const file = bucket.file(nomeArquivo);

      const stream = file.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
        resumable: true,
      });

      await new Promise((resolve, reject) => {
        let retries = 3;
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const uploadWithRetry = async () => {
          try {
            stream.on("error", (e) => {
              console.error("Erro no upload do arquivo:", e.message, e.stack);
              reject(e);
            });

            stream.on("finish", async () => {
              try {
                const [url] = await file.getSignedUrl({
                  action: 'read',
                  expires: '03-09-2500',
                });
                image.firebaseUrl = url;
                resolve();
              } catch (error) {
                reject(error);
              }
            });

            stream.end(image.buffer);
          } catch (e) {
            console.log("Erro no upload, tentando novamente...");
            if (retries > 0) {
              retries--;
              await delay(3000);
              uploadWithRetry();
            } else {
              reject(e);
            }
          }
        };

        uploadWithRetry();
      });
    });

    await Promise.all(uploadPromises);
    next();
  } catch (error) {
    next(error);
  }
};


module.exports = uploadImovel;