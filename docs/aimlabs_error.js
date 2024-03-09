class AimlabsError extends Error {
  /**
   * @param {number} status
   * @param {string} body
   */
  constructor(status, body) {
    super("Aimlabs request failed.");
    this.name = "AimlabsError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Generate an AimlabsError from a Response and its body.
 * @param {Response} resp
 * @param {string} body
 * @returns
 */
var newAimlabsError = (resp, body) => {
  return new AimlabsError(resp.status, body);
};

/**
 * Handle an error by replacing the page with an error message.
 * @param {Error} error
 */
var handleError = (error) => {
  if (error instanceof AimlabsError) {
    document.body.innerHTML = `<div class="red"><h1>Error ${error.status}</h1><pre>${error.message}\n\nDetails: ${error.body}</pre></div>`;
  } else {
    console.warn(error);
  }
};
