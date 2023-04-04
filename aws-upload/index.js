const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

// handler 함수가 람다 호출 시 실행된다:
exports.handler = async (event, context, callback) => {
  // event 객체로부터 버킷 이름 (Bucket)과 파일 경로 (Key), 파일명(filename), 확장자(ext)를 가져온다:
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split("/")[Key.split("/").length - 1];
  const ext = Key.split(".")[Key.split(".").length - 1];
  const requiredFormat = ext === "jpg" ? "jpeg" : ext; // sharp에서는 jpg 대신 jpeg 사용합니다.
  console.log("name", filename, "ext", ext);

  try {
    // s3.getObject 메서드로 버킷에서 파일을 가져온다:
    const s3Object = await s3.getObject({ Bucket, Key }).promise(); // 버퍼로 가져오기
    console.log("original", s3Object.Body.length);
    // 이미지 리사이징 (sharp 메서드):
    const resizedImage = await sharp(s3Object.Body)
      .resize(200, 200, { fit: "inside" })
      .toFormat(requiredFormat)
      .toBuffer();
    await s3
      .putObject({
        // thumb 폴더에 저장
        Bucket,
        Key: `thumb/${filename}`,
        Body: resizedImage,
      })
      .promise();
    console.log("put", resizedImage.length);
    return callback(null, `thumb/${filename}`);
  } catch (error) {
    console.error(error);
    return callback(error);
  }
};
