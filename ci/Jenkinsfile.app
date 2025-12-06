pipeline {

    agent { label 'linux_02' }

    environment {
        DEV_ENV_FILE = credentials("todolist_dev_env")
    }

    stages {

        /* -------------------------------------------------------------
           0. Checkout
        ------------------------------------------------------------- */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* -------------------------------------------------------------
           1. Build Docker Images (dev)
        ------------------------------------------------------------- */
        stage('Build Docker Images (DEV)') {
            steps {
                script {
                    // package.json에서 버전 읽기
                    def backendVersion = readJSON file: "web/backend/package.json"
                    def version = backendVersion.version
                    def versionTag = "v${version}"
                    
                    echo "📦 Building images with version: ${versionTag}"
                    
                    sh """
                        cd "${WORKSPACE}"
                        chmod +x scripts/docker_build.sh
                        ./scripts/docker_build.sh ${versionTag} dev
                    """
                }
            }
        }

        /* -------------------------------------------------------------
           2. Load DEV Credentials & Generate .env (DEV)
        ------------------------------------------------------------- */
        stage('Load DEV Credentials & Generate .env') {
            steps {
                script {
                    echo "📦 Loading DEV Credential file..."
                    def DEV_MAP = readProperties file: DEV_ENV_FILE
                    
                    echo "📝 Writing deploy/.env-dev (DEV)..."
                    def text = DEV_MAP.collect { k, v -> "${k}=${v}" }.join("\n")
                    writeFile file: "deploy/.env-dev", text: text
                }
            }
        }

        /* -------------------------------------------------------------
           3. Run DEV Containers
        ------------------------------------------------------------- */
        stage('Run DEV Containers') {
            steps {
                sh """
                    cd "${WORKSPACE}"
                    chmod +x scripts/deploy.sh
                    ./scripts/deploy.sh dev
                """
            }
        }

        /* -------------------------------------------------------------
           4. Run Test Job
        ------------------------------------------------------------- */
        stage('Run Test Job') {
            steps {
                script {
                    echo "🧪 Running todolist_test Jenkins job..."
                    build job: 'todolist_test', wait: true
                }
            }
        }

        /* -------------------------------------------------------------
           5. Stop DEV Containers
        ------------------------------------------------------------- */
        stage('Stop DEV Containers') {
            steps {
                sh """
                    cd "${WORKSPACE}"
                    docker compose -f docker-compose.yml down --remove-orphans || true
                    docker rm -f todo-backend todo-frontend todo-postgres 2>/dev/null || true
                """
            }
        }
    }
}
