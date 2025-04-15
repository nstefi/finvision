declare namespace NodeJS {
    interface ProcessEnv {
        ALPHA_VANTAGE_API_KEY: string
        NODE_ENV: 'development' | 'production'
        PORT?: string
        PWD: string
    }
} 