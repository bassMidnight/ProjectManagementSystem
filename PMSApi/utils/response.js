module.exports = {
    successDataResponse: async (result) => {
      return { code: 200, result };
    },
    success: async (message) => {
      return { code: 200, result: { message } };
    },
    createSuccessResponse: async (message) => {
      return { code: 201, result: { message } };
    },
    badRequest: async (message) => {
      return { code: 400, result: { message } };
    },
    permissionUnauthorized: async (message) => {
      return { code: 401, result: { message } };
    },
    dataNotFound: async(message) => {
      return { code: 404, result: { message: message } };
    },
    permissionForbidden: async (message) => {
      return { code: 403, result: { message } };
    },
    errServerResponse: async (message) => {
      return { code: 500, result: { message } };
    },
  };
  