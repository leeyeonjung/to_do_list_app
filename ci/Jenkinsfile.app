pipeline {

    agent { label 'linux_02' }

    environment {
        DEV_ENV_FILE  = credentials("todolist_dev_env")
        PROD_ENV_FILE = credentials("todolist_prod_env")
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
           1. Build Dev Images
        ------------------------------------------------------------- */
        stage('Build Dev Images') {
            steps {
                script {
                    def backendVersion = readJSON file: "web/backend/package.json"
                    def version = backendVersion.version
                    env.VERSION_TAG = "v${version}"

                    echo "📦 Building DEV images: ${VERSION_TAG}-dev"

                    sh """
                        chmod +x scripts/docker_build.sh
                        ./scripts/docker_build.sh ${VERSION_TAG} dev
                    """
                }
            }
        }

        /* -------------------------------------------------------------
           2. Create .env-dev
        ------------------------------------------------------------- */
        stage('Create .env-dev') {
            steps {
                script {
                    echo "📄 Writing deploy/.env-dev"

                    def MAP = readProperties file: DEV_ENV_FILE
                    def text = MAP.collect { k, v -> "${k}=${v}" }.join("\n")

                    writeFile file: "deploy/.env-dev", text: text
                }
            }
        }

        /* -------------------------------------------------------------
           3. Run Dev Containers
        ------------------------------------------------------------- */
        stage('Run Dev Containers') {
            steps {
                sh """
                    chmod +x scripts/deploy.sh
                    ./scripts/deploy.sh dev
                """
            }
        }

        /* -------------------------------------------------------------
           4. Run Tests
        ------------------------------------------------------------- */
        stage('Run Test Job') {
            steps {
                script {
                    echo "🧪 Running todolist_test job..."
                    build job: 'todolist_test', wait: true
                }
            }
        }

        /* -------------------------------------------------------------
           5. Stop Dev Containers
        ------------------------------------------------------------- */
        stage('Stop Dev Containers') {
            steps {
                sh """
                    docker compose -f docker-compose.yml down --remove-orphans || true
                    docker rm -f todo-backend todo-frontend todo-postgres 2>/dev/null || true
                """
            }
        }

        /* -------------------------------------------------------------
           6. Build Prod Images
        ------------------------------------------------------------- */
        stage('Build Prod Images') {
            steps {
                script {
                    echo "📦 Building PROD images: ${VERSION_TAG}-prod"

                    sh """
                        chmod +x scripts/docker_build.sh
                        ./scripts/docker_build.sh ${VERSION_TAG} prod
                    """
                }
            }
        }

        /* -------------------------------------------------------------
           7. Create .env-prod
        ------------------------------------------------------------- */
        stage('Create .env-prod') {
            steps {
                script {
                    def MAP = readProperties file: PROD_ENV_FILE
                    def text = MAP.collect { k, v -> "${k}=${v}" }.join("\n")

                    writeFile file: "deploy/.env-prod", text: text
                }
            }
        }

        /* -------------------------------------------------------------
           8. Load Prod Images Automatically
        ------------------------------------------------------------- */
        stage('Load Prod Images') {
            steps {
                sh """
                    echo "📦 Loading PROD Docker images..."

                    docker load < deploy/images/backend-${VERSION_TAG}-prod.tar.gz
                    docker load < deploy/images/frontend-${VERSION_TAG}-prod.tar.gz

                    echo "🔥 Prod images loaded successfully."
                """
            }
        }

        /* -------------------------------------------------------------
           9. Deploy Prod Containers
        ------------------------------------------------------------- */
        stage('Deploy Prod Containers') {
            steps {
                sh """
                    chmod +x scripts/deploy.sh
                    ./scripts/deploy.sh prod
                """
            }
        }
    }

    post {
        success {
            echo "🎉 PROD DEPLOYMENT SUCCESS"
        }
        failure {
            echo "❌ PIPELINE FAILED"
        }
        always {
            echo "🏁 Pipeline Completed"
        }
    }
}
