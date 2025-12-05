pipeline {
    agent none

    stages {

        /* ============================================================
           1. Load DEV Credentials
        ============================================================ */
        stage('Load DEV Credentials') {
            agent { label 'linux_02' }
            environment {
                DEV_ENV_FILE = credentials("todolist_dev_env")
            }
            steps {
                script {
                    echo "📦 Loading DEV credentials (.env-dev)..."
                    DEV_MAP = readProperties file: DEV_ENV_FILE
                }
            }
        }

        /* ============================================================
           2. Generate DEV .env File
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
                sh """
                    cd /home/ubuntu/jenkins_agent/workspace/todolist_app
                    git pull origin main || git pull origin maste
                    chmod +x scripts/docker_build.sh
                    ./scripts/docker_build.sh
                    chmod +x scripts/deploy.sh
                    ./scripts/deploy.sh
                """
            }
        }


        // stage('Send Artifacts to PROD Server') {
        //     steps {
        //         sh """
        //             cp docker-compose.yml ubuntu@B2_SERVER:/home/ubuntu/todolist_app/
        //             cp scripts/deploy.sh ubuntu@B2_SERVER:/home/ubuntu/todolist_app/
        //             cp deploy/images/backend.tar.gz ubuntu@B2_SERVER:/home/ubuntu/todolist_app/
        //             cp deploy/images/frontend.tar.gz ubuntu@B2_SERVER:/home/ubuntu/todolist_app/
        //         """
        //     }
        // }

        // /* ============================================================
        //    4. Remote Deploy on PROD (B-2)
        // ============================================================ */
        // stage('Execute Remote Deploy') {
        //     steps {
        //         sh """
        //             ssh ubuntu@B2_SERVER '
        //                 cd /home/ubuntu/todolist_app
        //                 chmod +x deploy.sh
        //                 ./deploy.sh ${ENV}
        //             '
        //         """
        //     }
        // }

//         /* ============================================================
//            4. Run Tests (Playwright/API)
//         ============================================================ */
//         stage('Run Tests') {
//             parallel {
//                 stage('Linux Tests') {
//                     steps {
//                         build job: "todolist_test",
//                             wait: true,
//                             propagate: true,
//                             parameters: [
//                                 string(name: "ENV", value: "dev"),
//                                 string(name: "AGENT", value: "linux_02")
//                             ]
//                     }
//                 }
//             }
//         }

//         /* ============================================================
//            5. Load PROD Credentials
//         ============================================================ */
//         stage('Load PROD Credentials') {
//             agent { label 'linux_02' }
//             environment {
//                 PROD_ENV_FILE = credentials("todolist_prod_env")
//             }
//             steps {
//                 script {
//                     echo "📦 Loading PROD credentials..."
//                     PROD_MAP = readProperties text: PROD_ENV_FILE
//                 }
//             }
//         }

//         /* ============================================================
//            6. Generate PROD .env File
//         ============================================================ */
//         stage('Generate PROD .env') {
//             agent { label 'linux_02' }
//             steps {
//                 script {
//                     echo "📝 Creating deploy/.env (PROD)"
//                     def text = PROD_MAP.collect { k, v -> "${k}=${v}" }.join("\n")
//                     writeFile file: "deploy/.env", text: text
//                 }
//             }
//         }

//         /* ============================================================
//            7. Trigger PROD Deployment (Jenkinsfile.linux)
//         ============================================================ */
//         stage('Trigger Linux Build/Deploy') {
//             steps {
//                 build job: "todolist_linux_deploy",
//                     wait: true,
//                     propagate: true,
//                     parameters: [
//                         string(name: "ENV", value: "prod")
//                     ]
//             }
//         }
    }
}
