pipeline {
    agent none

    stages {
        /* ---------------------------------------------------------
           1. Load DEV credentials
        --------------------------------------------------------- */
        stage('Load DEV Credentials') {
            agent { label 'linux_02' }
            environment {
                DEV_ENV_FILE = credentials("todolist_dev_env")
            }
            steps {
                script {
                    echo "📦 Loading DEV credentials..."
                    DEV_MAP = readProperties text: DEV_ENV_FILE
                }
            }
        }

        /* ---------------------------------------------------------
           2. Generate .env (DEV)
        --------------------------------------------------------- */
        stage('Generate DEV .env') {
            agent { label 'linux_02' }
            steps {
                script {
                    sh "cp config/.env.template .env"

                    DEV_MAP.each { k, v ->
                        sh "sed -i 's|{{${k}}}|${v}|g' .env"
                    }
                }
            }
        }

        /* ---------------------------------------------------------
           3. DEV Deploy (Linux)
        --------------------------------------------------------- */
        stage('DEV Deploy - Linux') {
            steps {
                build job: "todolist_linux_deploy",
                    wait: true,
                    parameters: [
                        string(name: "ENV", value: "dev")
                    ]
            }
        }

        /* ---------------------------------------------------------
           4. DEV Deploy (Windows)
        --------------------------------------------------------- */
        stage('DEV Deploy - Windows') {
            steps {
                build job: "todolist_windows_deploy",
                    wait: true,
                    parameters: [
                        string(name: "ENV", value: "dev")
                    ]
            }
        }

        /* ---------------------------------------------------------
           5. Run Tests (Linux + Windows)
        --------------------------------------------------------- */
        stage('Run Tests') {
            parallel {
                stage('Linux Test') {
                    steps {
                        build job: "todolist_test",
                            wait: true,
                            propagate: true,
                            parameters: [
                                string(name: "ENV", value: "dev"),
                                string(name: "AGENT", value: "linux_02")
                            ]
                    }
                }
                stage('Windows Test') {
                    steps {
                        build job: "todolist_test",
                            wait: true,
                            propagate: true,
                            parameters: [
                                string(name: "ENV", value: "dev"),
                                string(name: "AGENT", value: "windows_01")
                            ]
                    }
                }
            }
        }

        /* ---------------------------------------------------------
           6. Load PROD Credentials
        --------------------------------------------------------- */
        stage('Load PROD Credentials') {
            agent { label 'linux_02' }
            environment {
                PROD_ENV_FILE = credentials("todolist_prod_env")
            }
            steps {
                script {
                    echo "📦 All tests passed. Loading PROD credentials..."
                    PROD_MAP = readProperties text: PROD_ENV_FILE
                }
            }
        }

        /* ---------------------------------------------------------
           7. Generate .env (PROD)
        --------------------------------------------------------- */
        stage('Generate PROD .env') {
            agent { label 'linux_02' }
            steps {
                script {
                    sh "cp config/.env.template .env"

                    PROD_MAP.each { k, v ->
                        sh "sed -i 's|{{${k}}}|${v}|g' .env"
                    }
                }
            }
        }

        /* ---------------------------------------------------------
           8. PROD Deploy (Linux Only)
        --------------------------------------------------------- */
        stage('PROD Deploy - Linux') {
            steps {
                build job: "todolist_linux_prod_deploy",
                    wait: true,
                    parameters: [
                        string(name: "ENV", value: "prod")
                    ]
            }
        }
    }

    post {
        failure {
            echo "❌ TEST FAILED → PROD DEPLOY SKIPPED"
        }
        success {
            echo "🎉 TEST SUCCESS → PROD DEPLOYED"
        }
    }
}
