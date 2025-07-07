const apiEnv: string = process.env.REACT_APP_URL_BASE_API || '';
const api: string = apiEnv ? apiEnv : '';

console.log(api);

const requestConfig = (
  method: string,
  data: any,
) => {
  let config: any = {};

  if (method === 'DELETE' || data === null) {
    config = {
      method: method,
      headers: {},
    };
  } else {
    config = {
      method: method,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  return config;
};

export { api, requestConfig };