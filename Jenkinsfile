pipeline {
  agent any

  environment {
    COMPOSE_DEV = "infra/compose/docker-compose.dev.yml"
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
        bat 'python -m py_compile scripts\\seed_db.py'
        bat 'python -m py_compile scripts\\export_data.py'
        bat 'python -m py_compile ml\\src\\preprocess.py'
        bat 'python -m py_compile ml\\src\\train.py'
        bat 'python -m py_compile ml\\src\\evaluate.py'
      }
    }

    stage('Build images') {
      steps {
        bat 'docker compose -f %COMPOSE_DEV% build'
      }
    }

    stage('Start stack') {
      steps {
        bat 'docker compose -f %COMPOSE_DEV% up -d'
      }
    }

    stage('Smoke test (Livres)') {
      steps {
        bat 'powershell -NoProfile -Command "Start-Sleep -Seconds 5; (Invoke-RestMethod http://localhost:8001/).status"'
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
      bat 'docker compose -f %COMPOSE_DEV% down -v'
    }
  }
}

