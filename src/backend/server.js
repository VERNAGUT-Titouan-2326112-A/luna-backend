const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { GoogleGenAI } = require('@google/genai');
const pool = require('./db');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Test de connexion PostgreSQL
pool.query('SELECT NOW()')
  .then(() => {
    console.log('🗄️ Connexion PostgreSQL réussie');
  })
  .catch((error) => {
    console.error('❌ Erreur PostgreSQL :', error);
  });


// =========================
// ROUTE IA
// =========================

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message vide',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message,
      config: {
        systemInstruction: `
Tu es Luna, un assistant spécialisé dans le cycle menstruel.

Tu réponds toujours en français.

Ton ton est :
- bienveillant
- simple
- rassurant
- non jugeant

Tu peux répondre aux questions concernant :
- les règles
- le cycle menstruel
- l'ovulation
- les symptômes
- les douleurs
- les variations du cycle
- le suivi menstruel

Tu ne poses jamais de diagnostic médical.

Si une situation semble inhabituelle ou préoccupante,
tu conseilles de consulter un médecin, une sage-femme
ou un autre professionnel de santé.

Tes réponses doivent être simples et faciles à comprendre.
        `,
      },
    });

    res.json({
      response: response.text,
    });

  } catch (error) {
    console.error('Erreur Gemini :', error);

    res.status(500).json({
      error: 'Erreur lors de la communication avec Luna',
    });
  }
});


// =========================
// INSCRIPTION
// =========================

app.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      weight,
      height,
      lastPeriodStart,
      cycleLength,
      periodLength,
      email,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !email ||
      !password ||
      !lastPeriodStart ||
      !cycleLength ||
      !periodLength
    ) {
      return res.status(400).json({
        error: 'Tous les champs obligatoires doivent être remplis',
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Cette adresse e-mail est déjà utilisée',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (
        first_name,
        last_name,
        birth_date,
        weight,
        height,
        last_period_start,
        cycle_length,
        period_length,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        first_name,
        last_name,
        birth_date,
        weight,
        height,
        last_period_start,
        cycle_length,
        period_length,
        email
      `,
      [
        firstName,
        lastName,
        birthDate,
        weight || null,
        height || null,
        lastPeriodStart,
        cycleLength,
        periodLength,
        email.toLowerCase(),
        passwordHash,
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        birthDate: user.birth_date,
        weight: user.weight,
        height: user.height,
        lastPeriodStart: user.last_period_start,
        cycleLength: user.cycle_length,
        periodLength: user.period_length,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Erreur inscription :', error);

    res.status(500).json({
      error: 'Erreur lors de la création du compte',
    });
  }
});


// =========================
// CONNEXION
// =========================

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'L’e-mail et le mot de passe sont obligatoires',
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash
      FROM users
      WHERE email = $1
      `,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'E-mail ou mot de passe incorrect',
      });
    }

    const user = result.rows[0];

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        error: 'E-mail ou mot de passe incorrect',
      });
    }

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Erreur connexion :', error);

    res.status(500).json({
      error: 'Erreur lors de la connexion',
    });
  }
});


// =========================
// RÉCUPÉRER UN UTILISATEUR
// =========================

app.get('/user/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        error: 'ID utilisateur invalide',
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        birth_date,
        weight,
        height,
        last_period_start,
        cycle_length,
        period_length,
        email
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur introuvable',
      });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      birthDate: user.birth_date,
      weight: user.weight,
      height: user.height,
      lastPeriodStart: user.last_period_start,
      cycleLength: user.cycle_length,
      periodLength: user.period_length,
      email: user.email,
    });

  } catch (error) {
    console.error('Erreur récupération utilisateur :', error);

    res.status(500).json({
      error: 'Erreur lors de la récupération des données',
    });
  }
});

app.get('/tracking/:userId', async (req, res) => {
    try {
      const userId = Number(req.params.userId);
  
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({
          error: 'ID utilisateur invalide',
        });
      }
  
      const result = await pool.query(
        `
        SELECT
          TO_CHAR(tracking_date, 'YYYY-MM-DD') AS tracking_date,
          period,
          flow,
          mood,
          symptoms,
          discharge,
          sex,
          medication,
          note
        FROM daily_tracking
        WHERE user_id = $1
        ORDER BY tracking_date ASC
        `,
        [userId]
      );
  
      const tracking = {};
  
      result.rows.forEach((row) => {
        // La date vient directement de PostgreSQL
        // sans conversion UTC.
        const dateKey = row.tracking_date;
  
        tracking[dateKey] = {
          period: row.period,
          flow: row.flow,
          mood: row.mood,
          symptoms: row.symptoms,
          discharge: row.discharge,
          sex: row.sex,
          medication: row.medication,
          note: row.note,
        };
      });
  
      res.json(tracking);
  
    } catch (error) {
      console.error('Erreur récupération suivi:', error);
  
      res.status(500).json({
        error: 'Erreur lors de la récupération du suivi',
      });
    }
  });   
  
  // Ajouter ou modifier un suivi
  app.put('/tracking/:userId/:date', async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const date = req.params.date;
  
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({
          error: 'ID utilisateur invalide',
        });
      }
  
      const {
        period,
        flow,
        mood,
        symptoms,
        discharge,
        sex,
        medication,
        note,
      } = req.body;
  
      const result = await pool.query(
        `
        INSERT INTO daily_tracking (
          user_id,
          tracking_date,
          period,
          flow,
          mood,
          symptoms,
          discharge,
          sex,
          medication,
          note
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10
        )
        ON CONFLICT (user_id, tracking_date)
        DO UPDATE SET
          period = EXCLUDED.period,
          flow = EXCLUDED.flow,
          mood = EXCLUDED.mood,
          symptoms = EXCLUDED.symptoms,
          discharge = EXCLUDED.discharge,
          sex = EXCLUDED.sex,
          medication = EXCLUDED.medication,
          note = EXCLUDED.note,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
        `,
        [
          userId,
          date,
          period ?? false,
          flow || null,
          mood || null,
          symptoms || null,
          discharge || null,
          sex ?? false,
          medication ?? false,
          note || null,
        ]
      );
  
      res.json({
        message: 'Suivi enregistré',
        tracking: result.rows[0],
      });
  
    } catch (error) {
      console.error('Erreur sauvegarde suivi:', error);
  
      res.status(500).json({
        error: 'Erreur lors de la sauvegarde du suivi',
      });
    }
  });
  
  
  // Supprimer un suivi
  app.delete('/tracking/:userId/:date', async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const date = req.params.date;
  
      if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({
          error: 'ID utilisateur invalide',
        });
      }
  
      await pool.query(
        `
        DELETE FROM daily_tracking
        WHERE user_id = $1
        AND tracking_date = $2
        `,
        [userId, date]
      );
  
      res.json({
        message: 'Suivi supprimé',
      });
  
    } catch (error) {
      console.error('Erreur suppression suivi:', error);
  
      res.status(500).json({
        error: 'Erreur lors de la suppression du suivi',
      });
    }
  });

  // =========================
// MODIFIER UN UTILISATEUR
// =========================

app.put('/user/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    const {
      firstName,
      lastName,
      birthDate,
      weight,
      height,
      cycleLength,
      periodLength,
    } = req.body;

    if (!firstName || !lastName || !birthDate || !cycleLength || !periodLength) {
      return res.status(400).json({
        error: 'Champs obligatoires manquants',
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        first_name = $1,
        last_name = $2,
        birth_date = $3,
        weight = $4,
        height = $5,
        cycle_length = $6,
        period_length = $7
      WHERE id = $8
      RETURNING
        id,
        first_name,
        last_name,
        birth_date,
        weight,
        height,
        last_period_start,
        cycle_length,
        period_length,
        email
      `,
      [
        firstName,
        lastName,
        birthDate,
        weight ? Number(weight) : null,
        height ? Number(height) : null,
        Number(cycleLength),
        Number(periodLength),
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const updatedUser = result.rows[0];

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        birthDate: updatedUser.birth_date,
        weight: updatedUser.weight,
        height: updatedUser.height,
        lastPeriodStart: updatedUser.last_period_start,
        cycleLength: updatedUser.cycle_length,
        periodLength: updatedUser.period_length,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Erreur modification profil :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// =========================
// SERVEUR
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Luna backend lancé sur le port ${PORT}`);
});