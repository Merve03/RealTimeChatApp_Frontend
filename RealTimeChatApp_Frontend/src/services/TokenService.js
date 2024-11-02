export const TokenService = {
  getLocalAccessToken: () => sessionStorage.getItem("accessToken"),
  getLocalRefreshToken: () => sessionStorage.getItem("refreshToken"),
  setTokens: (accessToken, refreshToken) => {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
  },
  removeTokens: () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  },
};
