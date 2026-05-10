pipeline {
  agent any

  environment {
    COMPOSE_STACK = "infra/compose/docker-compose.yml"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Python lint (basic)') {
      steps {
        bat 'python -m py_compile services\\livres\\main.py'
        bat 'python -m py_compile services\\emprunts\\main.py'
        bat 'python -m py_compile services\\reco\\main.py'
        bat 'python -m py_compile services\\utilisateurs\\main.py'
        bat 'python -m py_compile scripts\\seed_db.py'
        bat 'python -m py_compile scripts\\export_data.py'
        bat 'python -m py_compile ml\\src\\preprocess.py'
        bat 'python -m py_compile ml\\src\\train.py'
        bat 'python -m py_compile ml\\src\\evaluate.py'
      }
    }

    stage('Build images') {
      steps {
        bat 'docker compose -f %COMPOSE_STACK% build'
      }
    }

    stage('Start stack') {
      steps {
        bat 'docker compose -f %COMPOSE_STACK% up -d'
      }
    }

    stage('Smoke test (services API)') {
      steps {
        bat 'powershell -NoProfile -Command "Start-Sleep -Seconds 8; Invoke-RestMethod http://localhost:8001/"'
        bat 'powershell -NoProfile -Command "Invoke-RestMethod http://localhost:8002/"'
        bat 'powershell -NoProfile -Command "Invoke-RestMethod http://localhost:8003/"'
        bat 'powershell -NoProfile -Command "Invoke-RestMethod http://localhost:8004/"'
      }
    }

    stage('DVC pipeline (skeleton)') {
      steps {
        dir('ml') {
          // Le dataset sera ajouté via DVC plus tard; ce stage valide le wiring.
          bat 'python -c "print(\\"DVC stage placeholder - add data/loans.csv with DVC\\")"'
        }
      }
    }
  }

  post {
    always {
      bat 'docker compose -f %COMPOSE_STACK% down -v'
    }
  }
}

