module.exports = {
	devServer: {
		proxy: {
			"/api": {
				target: "https://doctor-dog.com/3000",
				changeOrigin: true,
				pathRewrite: {
					"^/api": "",
				},
			},
		},
	},
};
