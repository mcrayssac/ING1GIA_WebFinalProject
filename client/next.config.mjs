import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.plugins.push(
            new webpack.DefinePlugin({
                CESIUM_BASE_URL: JSON.stringify('cesium'),
            })
        );
        return config;
    },
};

export default nextConfig;