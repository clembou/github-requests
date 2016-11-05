export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
  }
}

export function parseJSON(response) {
  return response.json();
}

export function getStandardHeaders(bearerToken) {
  let headers = { 'Content-Type': 'application/json' };

  if (bearerToken)
    headers.Authorization = 'Bearer ' + bearerToken
  return headers;
}
