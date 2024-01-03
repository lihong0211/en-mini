module.exports = {
	devServer: {
		proxy: {
			"/api": {
				target: "http://8.137.107.171/3000",
				changeOrigin: true,
				pathRewrite: {
					"^/api": "",
				},
			},
		},
	},
};
