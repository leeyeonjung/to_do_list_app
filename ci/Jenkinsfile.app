pipeline {
    agent none

    stages {

        /* ============================================================
           1. Load DEV Credentials (.env-dev)
        ============================================================ */
        stage('Load DEV Credentials') {
            agent { label 'linux_02' }
            environment {
                DEV_ENV_FILE = credentials("todolist_dev_env")
            }
            steps {
                script {
                    echo "📦 Loading DEV credentials..."
                    DEV_MAP = readProperties file: DEV_ENV_FILE
                }
            }
        }

        /* ============================================================
           2. Generate DEV .env
        ============================================================ */
        stage('Generate DEV .env') {
            agent { label 'linux_02' }
            steps {
                script {
                    echo "📝 Creating deploy/.env (DEV)"
                    def text = DEV_MAP.collect { k, v -> "${k}=${v}" }.join("\n")
                    writeFile file: "deploy/.env", text: text
                }
            }
        }

        /* ============================================================
           3. Run DEV Container (B-1)
        ============================================================ */
        stage('Run DEV Container') {
            agent { label 'linux_02' }
            steps {
                script {
                    echo "🚀 Running DEV Container..."
                }
                sh """
                    cd "${WORKSPACE}"

                    echo "📥 Pulling latest main branch..."
                    git pull origin main || git pull origin master

                    echo "🔨 Building docker images..."
                    chmod +x scripts/docker_build.sh
                    ./scripts/docker_build.sh

                    echo "🚀 Starting DEV container..."
                    chmod +x scripts/deploy.sh
                    ./scripts/deploy.sh dev
                """
            }
        }
    }
}
