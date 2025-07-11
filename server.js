// server.js - Main backend server file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wanoarckaido:IKlOtl8D9bBEn1IR@football-prediction.aaekq3f.mongodb.net/?retryWrites=true&w=majority&appName=Football-Prediction';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Schemas
const userBetSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    ticketId: { type: String, required: true, unique: true },
    bets: [{
        matchId: Number,
        match: String,
        type: String, // 'home', 'draw', 'away'
        odds: Number
    }],
    totalOdds: { type: Number, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'won', 'lost'] },
    createdAt: { type: Date, default: Date.now },
    result: {
        correctPredictions: { type: Number, default: 0 },
        totalPredictions: { type: Number, default: 8 },
        isWinner: { type: Boolean, default: false }
    }
});

const matchSchema = new mongoose.Schema({
    matchId: { type: Number, required: true, unique: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    startTime: { type: Date, required: true },
    odds: {
        home: { type: Number, required: true },
        draw: { type: Number, required: true },
        away: { type: Number, required: true }
    },
    result: {
        homeScore: { type: Number, default: null },
        awayScore: { type: Number, default: null },
        outcome: { type: String, default: null }, // 'home', 'draw', 'away'
        isFinished: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now }
});

// Models
const UserBet = mongoose.model('UserBet', userBetSchema);
const Match = mongoose.model('Match', matchSchema);

// Initialize sample matches
async function initializeMatches() {
    try {
        const existingMatches = await Match.countDocuments();
        if (existingMatches === 0) {
            const sampleMatches = [
                {
                    matchId: 1,
                    homeTeam: 'Manchester United',
                    awayTeam: 'Liverpool',
                    startTime: new Date('2025-07-12T15:00:00Z'),
                    odds: { home: 2.10, draw: 3.40, away: 3.20 }
                },
                {
                    matchId: 2,
                    homeTeam: 'Barcelona',
                    awayTeam: 'Real Madrid',
                    startTime: new Date('2025-07-12T18:00:00Z'),
                    odds: { home: 2.50, draw: 3.10, away: 2.80 }
                },
                {
                    matchId: 3,
                    homeTeam: 'Bayern Munich',
                    awayTeam: 'Borussia Dortmund',
                    startTime: new Date('2025-07-12T20:00:00Z'),
                    odds: { home: 1.80, draw: 3.60, away: 4.20 }
                },
                {
                    matchId: 4,
                    homeTeam: 'PSG',
                    awayTeam: 'Lyon',
                    startTime: new Date('2025-07-13T15:00:00Z'),
                    odds: { home: 1.70, draw: 3.80, away: 4.50 }
                },
                {
                    matchId: 5,
                    homeTeam: 'Juventus',
                    awayTeam: 'AC Milan',
                    startTime: new Date('2025-07-13T18:00:00Z'),
                    odds: { home: 2.20, draw: 3.30, away: 3.10 }
                },
                {
                    matchId: 6,
                    homeTeam: 'Chelsea',
                    awayTeam: 'Arsenal',
                    startTime: new Date('2025-07-13T20:00:00Z'),
                    odds: { home: 2.60, draw: 3.20, away: 2.70 }
                },
                {
                    matchId: 7,
                    homeTeam: 'Atletico Madrid',
                    awayTeam: 'Sevilla',
                    startTime: new Date('2025-07-14T15:00:00Z'),
                    odds: { home: 2.00, draw: 3.50, away: 3.60 }
                },
                {
                    matchId: 8,
                    homeTeam: 'Inter Milan',
                    awayTeam: 'Napoli',
                    startTime: new Date('2025-07-14T18:00:00Z'),
                    odds: { home: 2.40, draw: 3.25, away: 2.90 }
                }
            ];

            await Match.insertMany(sampleMatches);
            console.log('Sample matches initialized');
        }
    } catch (error) {
        console.error('Error initializing matches:', error);
    }
}

// Routes

// Check if user already has a bet
app.post('/api/check-user', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const existingBet = await UserBet.findOne({ username });
        
        res.json({
            success: true,
            hasBet: !!existingBet,
            ticket: existingBet || null
        });
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Submit bet
async function submitBet() {
  if (selectedBets.length !== 8) {
    alert('Please select bets for all 8 matches');
    return;
  }

  const cleanedBets = selectedBets.map(bet => ({
    ...bet,
    matchId: Number(bet.matchId)
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/submit-bet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: currentUser,
        bets: cleanedBets,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showTicketModal(data.ticket);
    } else {
      alert('Error submitting bet: ' + data.message);
    }

  } catch (error) {
    console.error('Submit bet error:', error);
    alert('Connection error. Please try again.');
  }
}


// Search ticket by username
app.post('/api/search-ticket', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const tickets = await UserBet.find({ username });
        
        res.json({
            success: true,
            tickets: tickets.map(ticket => ({
                id: ticket.ticketId,
                username: ticket.username,
                totalOdds: ticket.totalOdds,
                status: ticket.status,
                createdAt: ticket.createdAt,
                bets: ticket.bets,
                result: ticket.result
            }))
        });
    } catch (error) {
        console.error('Error searching ticket:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset player (admin only)
app.post('/api/reset-player', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const result = await UserBet.deleteOne({ username });
        
        if (result.deletedCount > 0) {
            res.json({
                success: true,
                message: `Player ${username} has been reset successfully`
            });
        } else {
            res.json({
                success: false,
                message: `No bet found for player ${username}`
            });
        }
    } catch (error) {
        console.error('Error resetting player:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all bets (admin only)
app.get('/api/all-bets', async (req, res) => {
    try {
        const bets = await UserBet.find({}).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            bets: bets.map(bet => ({
                id: bet.ticketId,
                username: bet.username,
                totalOdds: bet.totalOdds,
                status: bet.status,
                createdAt: bet.createdAt,
                result: bet.result
            }))
        });
    } catch (error) {
        console.error('Error getting all bets:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get matches
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find({}).sort({ matchId: 1 });
        res.json({ success: true, matches });
    } catch (error) {
        console.error('Error getting matches:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update match result (admin only)
app.post('/api/update-match-result', async (req, res) => {
    try {
        const { matchId, homeScore, awayScore } = req.body;
        
        if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Match ID, home score, and away score are required' 
            });
        }

        // Determine outcome
        let outcome;
        if (homeScore > awayScore) {
            outcome = 'home';
        } else if (homeScore < awayScore) {
            outcome = 'away';
        } else {
            outcome = 'draw';
        }

        // Update match
        const match = await Match.findOneAndUpdate(
            { matchId },
            {
                'result.homeScore': homeScore,
                'result.awayScore': awayScore,
                'result.outcome': outcome,
                'result.isFinished': true
            },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ 
                success: false, 
                message: 'Match not found' 
            });
        }

        // Update all affected bets
        await updateBetResults();

        res.json({
            success: true,
            message: 'Match result updated successfully',
            match
        });
    } catch (error) {
        console.error('Error updating match result:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update odds (admin only)
app.post('/api/update-odds', async (req, res) => {
    try {
        const { matchId, odds } = req.body;
        
        if (!matchId || !odds) {
            return res.status(400).json({ 
                success: false, 
                message: 'Match ID and odds are required' 
            });
        }

        const match = await Match.findOneAndUpdate(
            { matchId },
            { odds },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ 
                success: false, 
                message: 'Match not found' 
            });
        }

        res.json({
            success: true,
            message: 'Odds updated successfully',
            match
        });
    } catch (error) {
        console.error('Error updating odds:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Function to update bet results based on match outcomes
async function updateBetResults() {
    try {
        const matches = await Match.find({ 'result.isFinished': true });
        const bets = await UserBet.find({ status: 'pending' });

        for (const bet of bets) {
            let correctPredictions = 0;
            let totalPredictions = bet.bets.length;

            for (const userBet of bet.bets) {
                const match = matches.find(m => m.matchId === userBet.matchId);
                if (match && match.result.outcome === userBet.type) {
                    correctPredictions++;
                }
            }

            // For parlay betting, all predictions must be correct to win
            const isWinner = correctPredictions === totalPredictions;
            const newStatus = isWinner ? 'won' : 'lost';

            await UserBet.findByIdAndUpdate(bet._id, {
                status: newStatus,
                'result.correctPredictions': correctPredictions,
                'result.totalPredictions': totalPredictions,
                'result.isWinner': isWinner
            });
        }

        console.log('Bet results updated');
    } catch (error) {
        console.error('Error updating bet results:', error);
    }
}

// Football API integration functions
const FOOTBALL_API_TOKEN = '43727dc8a0194dfeaa01571ef275b871';

// Fetch live odds from football API
async function fetchLiveOdds() {
    try {
        // Note: This is a placeholder for the actual API integration
        // You'll need to implement based on the specific API you're using
        
        console.log('Fetching live odds with token:', FOOTBALL_API_TOKEN);
        
        // Example API call (adjust based on your API provider)
        // const response = await fetch(`https://api.football-data.org/v2/competitions/2021/matches`, {
        //     headers: {
        //         'X-Auth-Token': FOOTBALL_API_TOKEN
        //     }
        // });
        // 
        // const data = await response.json();
        // 
        // // Update matches with live data
        // for (const match of data.matches) {
        //     await Match.findOneAndUpdate(
        //         { matchId: match.id },
        //         {
        //             odds: {
        //                 home: match.odds?.home || 2.0,
        //                 draw: match.odds?.draw || 3.0,
        //                 away: match.odds?.away || 3.0
        //             }
        //         }
        //     );
        // }
        
    } catch (error) {
        console.error('Error fetching live odds:', error);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeMatches();
    
    // Fetch live odds every 5 minutes
    setInterval(fetchLiveOdds, 5 * 60 * 1000);
});

module.exports = app;