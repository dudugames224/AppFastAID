const path = require("path");
const { applicationDefault, cert, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "fastaid-d89e6";
const CONFIRMATION = "DELETE_ALL_FASTAID_USERS";
const USERS_COLLECTION = "users";

function initAdmin() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    const resolvedPath = path.resolve(serviceAccountPath);
    const fileContent = fs.readFileSync(resolvedPath, "utf-8");
    const serviceAccount = JSON.parse(fileContent);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID,
    });
    return;
  }

  initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
}

async function deleteAuthUsers() {
  const auth = getAuth();
  let nextPageToken;
  let total = 0;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    const uids = page.users.map((user) => user.uid);

    if (uids.length > 0) {
      const result = await auth.deleteUsers(uids);
      total += result.successCount;

      if (result.failureCount > 0) {
        console.error("Falhas ao apagar usuários do Authentication:", result.errors);
      }
    }

    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return total;
}

async function deleteDocumentTree(db, docRef, batchState) {
  const subcollections = await docRef.listCollections();

  for (const subcollection of subcollections) {
    await deleteCollectionTree(db, subcollection, batchState);
  }

  batchState.batch.delete(docRef);
  batchState.count += 1;

  if (batchState.count >= 450) {
    await batchState.batch.commit();
    batchState.batch = db.batch();
    batchState.count = 0;
  }
}

async function flushBatch(db, batchState) {
  if (batchState.count === 0) {
    return;
  }

  await batchState.batch.commit();
  batchState.batch = db.batch();
  batchState.count = 0;
}

async function deleteCollectionTree(db, collectionRef, batchState) {
  while (true) {
    const snapshot = await collectionRef.limit(100).get();

    if (snapshot.empty) {
      return;
    }

    for (const doc of snapshot.docs) {
      await deleteDocumentTree(db, doc.ref, batchState);
    }

    await flushBatch(db, batchState);
  }
}

async function deleteFirestoreUsers() {
  const db = getFirestore();
  const batchState = {
    batch: db.batch(),
    count: 0,
  };

  await deleteCollectionTree(db, db.collection(USERS_COLLECTION), batchState);

  await flushBatch(db, batchState);
}

async function main() {
  if (process.env.CONFIRM_DELETE_FIREBASE_USERS !== CONFIRMATION) {
    console.error("Operação cancelada.");
    console.error(`Para apagar tudo, execute com CONFIRM_DELETE_FIREBASE_USERS=${CONFIRMATION}`);
    process.exit(1);
  }

  initAdmin();

  console.log(`Projeto: ${PROJECT_ID}`);
  console.log("Apagando usuários do Firebase Authentication...");
  const deletedAuthUsers = await deleteAuthUsers();
  console.log(`Authentication: ${deletedAuthUsers} usuário(s) apagado(s).`);

  console.log(`Apagando documentos e subcoleções de Firestore: ${USERS_COLLECTION}...`);
  await deleteFirestoreUsers();
  console.log("Firestore: coleção users apagada.");
}

main().catch((error) => {
  console.error("Erro ao apagar usuários:", error);
  process.exit(1);
});
