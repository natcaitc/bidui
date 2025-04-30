// @/src/utils/getErrorMessage.js
export function getErrorMessage (e) {
  if (typeof e === 'object' && e !== null && e.message) {
    // When Laravel returns an error it's typically handled as an AxiosError object
    return e.response.data.message;
  } else {
    // When there's a script error in the .then block just return the error
    return e || 'Unknown error occurred';
  }
}
