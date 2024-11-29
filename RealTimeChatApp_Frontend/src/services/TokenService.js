class TokenService {
  static getLocalAccessToken() {
    return localStorage.getItem("accessToken");
  }

  static getLocalRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  static setTokens(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  static removeTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

export { TokenService };
