async function getSignedUrl(filename) {
  const nimbella = require('nim');
  const bucket = await nimbella.storage();

  await bucket.setMetadata({
    cors: [
      {
        origin: ['*'],
        responseHeader: [
          'Content-Type',
          'Cache-Control',
          'Expires',
          'Last-Modified',
          'Content-Disposition',
          'Access-Control-Allow-Origin',
          'Cross-Domain'
        ],
        method: ['*'],
        maxAgeSeconds: 3600
      }
    ]
  });

  const file = bucket.file(filename);
  const expiration = 15 * 60 * 1000; // 15 minutes

  const putOptions = {
    version: 'v4',
    action: 'write',
    contentType: 'multipart/formdata; charset=UTF-8',
    expires: Date.now() + expiration
  };

  const getOptions = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiration
  };

  return Promise.all([
    file.getSignedUrl(putOptions),
    file.getSignedUrl(getOptions)
  ])
    .then(([[signedPutUrl], [signedGetUrl]]) => {
      return {
        body: {signedPutUrl, signedGetUrl, bucketName: bucket.id}
      };
    })
    .catch(error => {
      console.log(error);
      return errorResponse(error.message);
    });
}

const main = args => {
  if (args.filename) {
    return getSignedUrl(args.filename);
  } else return errorResponse('filename required');
};

function errorResponse(msg) {
  return {
    statusCode: 400,
    body: {
      error: msg
    }
  };
}

exports.main = main;
