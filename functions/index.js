const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
initializeApp();

const line = require("./utils/line");
const gemini = require("./utils/gemini");

exports.webhook = onRequest(async (req, res) => {
  if (req.method === "POST") {
    const events = req.body.events;
    for (const event of events) {
    //   if (event.message.text.toLowerCase().includes("@ai")) {
      switch (event.type) {
        case "message":
          if (event.message.type === "text") {
            const msg = await gemini.chat(event.message.text);
            await line.reply(event.replyToken, [{type: "text", text: msg}]);
            return res.end();
          }
          if (event.message.type === "image") {
            const imageBinary = await line.getImageBinary(event.message.id);
            const msg = await gemini.multimodal(imageBinary);
            await line.reply(event.replyToken, [{type: "text", text: msg}]);
            return res.end();
          }
          break;
      }
      return res.end(); // หยุดการประมวลผลข้อความนี้
    }
  }
  return res.send(req.method);
});
