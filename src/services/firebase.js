const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

const KEY_PATH = process.env.FIREBASE_KEY_PATH || '/etc/secrets/firebase-key.json';

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'imogoat-oficial-ab14c.appspot.com';

function initFirebase() {
  try {
    const serviceAccount = require(KEY_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: BUCKET,
    });
    console.log('[Firebase] Inicializado com Secret File do Render.');
    return;
  } catch (err) {
    console.warn('[Firebase] Não encontrou secret em', KEY_PATH, '- tentando fallback local...');
    try {
      const serviceAccountLocal = require('../../etc/secrets/firebase-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountLocal),
        storageBucket: BUCKET,
      });
      console.log('[Firebase] Inicializado com arquivo local.');
      return;
    } catch (err2) {
      console.error('[Firebase] Falha ao inicializar credenciais!');
      console.error(err2);
      throw err2;
    }
  }
}

initFirebase();

const bucket = admin.storage().bucket(BUCKET);

const uploadImovel = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const uploadPromises = req.files.map(async (image) => {
      const nomeArquivo = `imoveis/${uuidv4()}.${image.originalname.split('.').pop()}`;
      const file = bucket.file(nomeArquivo);

      const stream = file.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
        resumable: true,
      });

      await new Promise((resolve, reject) => {
        let retries = 3;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const uploadWithRetry = async () => {
          try {
            stream.on('error', (e) => {
              console.error('Erro no upload do arquivo:', e.message, e.stack);
              reject(e);
            });

            stream.on('finish', async () => {
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
            console.log('Erro no upload, tentando novamente...');
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
    console.error('[Firebase] Erro geral no upload:', error);
    next(error);
  }
};

module.exports = uploadImovel;
