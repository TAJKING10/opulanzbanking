/**
 * Investments Routes
 *
 * Handles investment management - linking investors to properties with ownership percentages.
 *
 * Endpoints:
 * - GET    /api/investment/investments              - List all investments
 * - GET    /api/investment/investments/:id          - Get single investment
 * - GET    /api/investment/investments/investor/:id - Get investments by investor
 * - GET    /api/investment/investments/property/:id - Get investments by property
 * - POST   /api/investment/investments              - Create new investment
 * - PATCH  /api/investment/investments/:id          - Update investment
 * - DELETE /api/investment/investments/:id          - Delete investment
 * - POST   /api/investment/investments/:id/distribution - Record distribution payment
 * - GET    /api/investment/investments/:id/calculate    - Calculate returns
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Log activity
const logActivity = async (type, description, adminId, adminName, investorId = null, propertyId = null, metadata = {}) => {
  try {
    await pool.query(
      `INSERT INTO investment_activity_logs (log_type, description, admin_id, admin_name, investor_id, property_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [type, description, adminId, adminName, investorId, propertyId, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

/**
 * GET /api/investment/investments/investor/:id
 * Get all investments for a specific investor
 * NOTE: This must be defined BEFORE /:id to prevent route conflicts
 */
router.get('/investor/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        i.*,
        p.title as property_title,
        p.location as property_location,
        p.property_type,
        p.status as property_status,
        p.images,
        p.target_return as property_target_return,
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested,
        COALESCE(ROUND((CURRENT_DATE - i.investment_date::date) / 365.0, 4), 0) as years_invested
      FROM investments i
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.investor_id = $1
      ORDER BY i.investment_date DESC
    `, [id]);

    // Calculate totals and returns for each investment
    const investments = result.rows.map(inv => {
      const yearsInvested = parseFloat(inv.years_invested) || 0;
      const expectedAnnualReturn = parseFloat(inv.expected_annual_return) || 0;
      const amountInvested = parseFloat(inv.amount_invested) || 0;
      const actualReturnToDate = parseFloat(inv.actual_return_to_date) || 0;

      const expectedReturnToDate = amountInvested * (expectedAnnualReturn / 100) * yearsInvested;
      const currentValue = amountInvested + actualReturnToDate;
      const roi = amountInvested > 0 ? (actualReturnToDate / amountInvested) * 100 : 0;

      return {
        ...inv,
        calculations: {
          expected_return_to_date: Math.round(expectedReturnToDate * 100) / 100,
          current_value: Math.round(currentValue * 100) / 100,
          roi_percentage: Math.round(roi * 100) / 100,
          profit_loss: Math.round(actualReturnToDate * 100) / 100,
          profit_loss_status: actualReturnToDate >= 0 ? 'profit' : 'loss'
        }
      };
    });

    // Calculate portfolio summary
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_invested), 0);
    const totalReturns = investments.reduce((sum, inv) => sum + parseFloat(inv.actual_return_to_date || 0), 0);
    const totalDistributions = investments.reduce((sum, inv) => sum + parseFloat(inv.distributions_received || 0), 0);
    const portfolioValue = totalInvested + totalReturns;
    const portfolioRoi = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: investments,
      summary: {
        total_investments: investments.length,
        total_invested: Math.round(totalInvested * 100) / 100,
        total_returns: Math.round(totalReturns * 100) / 100,
        total_distributions: Math.round(totalDistributions * 100) / 100,
        portfolio_value: Math.round(portfolioValue * 100) / 100,
        portfolio_roi: Math.round(portfolioRoi * 100) / 100,
        overall_status: totalReturns >= 0 ? 'profit' : 'loss'
      }
    });
  } catch (error) {
    console.error('Error fetching investor investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments/property/:id
 * Get all investments for a specific property
 * NOTE: This must be defined BEFORE /:id to prevent route conflicts
 */
router.get('/property/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.company_name as investor_company,
        inv.investor_type,
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      WHERE i.property_id = $1
      ORDER BY i.ownership_percentage DESC
    `, [id]);

    // Calculate property investment summary
    const totalRaised = result.rows.reduce((sum, inv) => sum + parseFloat(inv.amount_invested), 0);
    const totalOwnership = result.rows.reduce((sum, inv) => sum + parseFloat(inv.ownership_percentage), 0);
    const totalShares = result.rows.reduce((sum, inv) => sum + (inv.number_of_shares || 0), 0);

    res.json({
      success: true,
      data: result.rows,
      summary: {
        total_investors: result.rows.length,
        total_raised: Math.round(totalRaised * 100) / 100,
        total_ownership_sold: Math.round(totalOwnership * 100) / 100,
        ownership_available: Math.round((100 - totalOwnership) * 100) / 100,
        total_shares_sold: totalShares
      }
    });
  } catch (error) {
    console.error('Error fetching property investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments
 * List all investments with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { investor_id, property_id, status, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.company_name as investor_company,
        p.title as property_title,
        p.location as property_location,
        p.status as property_status,
        p.target_return as property_target_return,
        -- Calculated fields
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested,
        COALESCE(ROUND((CURRENT_DATE - i.investment_date::date) / 365.0, 2), 0) as years_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (investor_id) {
      query += ` AND i.investor_id = $${paramIndex}`;
      params.push(investor_id);
      paramIndex++;
    }

    if (property_id) {
      query += ` AND i.property_id = $${paramIndex}`;
      params.push(property_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM investments i WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (investor_id) {
      countQuery += ` AND i.investor_id = $${countIndex}`;
      countParams.push(investor_id);
      countIndex++;
    }

    if (property_id) {
      countQuery += ` AND i.property_id = $${countIndex}`;
      countParams.push(property_id);
      countIndex++;
    }

    if (status) {
      countQuery += ` AND i.status = $${countIndex}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments/:id
 * Get single investment with full details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        inv.email as investor_email,
        inv.phone as investor_phone,
        inv.company_name as investor_company,
        inv.investor_type,
        p.title as property_title,
        p.location as property_location,
        p.property_type,
        p.status as property_status,
        p.total_value as property_total_value,
        p.total_shares as property_total_shares,
        p.target_return as property_target_return,
        p.investment_term as property_investment_term,
        p.distribution_frequency,
        -- Calculated fields
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested,
        COALESCE(ROUND((CURRENT_DATE - i.investment_date::date) / 365.0, 4), 0) as years_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = result.rows[0];

    // Calculate returns
    const yearsInvested = parseFloat(investment.years_invested) || 0;
    const expectedAnnualReturn = parseFloat(investment.expected_annual_return) || 0;
    const amountInvested = parseFloat(investment.amount_invested) || 0;
    const actualReturnToDate = parseFloat(investment.actual_return_to_date) || 0;

    // Expected return to date (simple interest)
    const expectedReturnToDate = amountInvested * (expectedAnnualReturn / 100) * yearsInvested;

    // Current estimated value
    const currentValue = amountInvested + actualReturnToDate;

    // Performance vs expected
    const performanceVsExpected = actualReturnToDate - expectedReturnToDate;

    // ROI percentage
    const roi = amountInvested > 0 ? (actualReturnToDate / amountInvested) * 100 : 0;

    // Annualized return
    const annualizedReturn = yearsInvested > 0 ? roi / yearsInvested : 0;

    // Projected final value at maturity
    let projectedFinalValue = amountInvested;
    if (investment.maturity_date) {
      const totalYears = (new Date(investment.maturity_date) - new Date(investment.investment_date)) / (365 * 24 * 60 * 60 * 1000);
      projectedFinalValue = amountInvested * (1 + (expectedAnnualReturn / 100) * totalYears);
    }

    res.json({
      success: true,
      data: {
        ...investment,
        calculations: {
          expected_return_to_date: Math.round(expectedReturnToDate * 100) / 100,
          current_value: Math.round(currentValue * 100) / 100,
          performance_vs_expected: Math.round(performanceVsExpected * 100) / 100,
          roi_percentage: Math.round(roi * 100) / 100,
          annualized_return: Math.round(annualizedReturn * 100) / 100,
          projected_final_value: Math.round(projectedFinalValue * 100) / 100,
          profit_loss: Math.round(actualReturnToDate * 100) / 100,
          profit_loss_status: actualReturnToDate >= 0 ? 'profit' : 'loss'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investments
 * Create new investment
 */
router.post('/', async (req, res) => {
  try {
    const {
      investor_id,
      property_id,
      amount_invested,
      ownership_percentage,
      number_of_shares = 1,
      investment_date,
      maturity_date,
      expected_annual_return,
      notes,
      createdBy
    } = req.body;

    // Validation
    if (!investor_id || !property_id || !amount_invested || !ownership_percentage) {
      return res.status(400).json({
        success: false,
        error: 'Investor, property, amount, and ownership percentage are required'
      });
    }

    // Check if investor exists
    const investorCheck = await pool.query('SELECT * FROM investment_investors WHERE id = $1', [investor_id]);
    if (investorCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }

    // Check if property exists
    const propertyCheck = await pool.query('SELECT * FROM investment_properties WHERE id = $1', [property_id]);
    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Check if investment already exists
    const existingCheck = await pool.query(
      'SELECT * FROM investments WHERE investor_id = $1 AND property_id = $2',
      [investor_id, property_id]
    );
    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Investment already exists for this investor and property'
      });
    }

    // Check total ownership doesn't exceed 100%
    const ownershipCheck = await pool.query(
      'SELECT COALESCE(SUM(ownership_percentage), 0) as total FROM investments WHERE property_id = $1',
      [property_id]
    );
    const currentOwnership = parseFloat(ownershipCheck.rows[0].total);
    if (currentOwnership + parseFloat(ownership_percentage) > 100) {
      return res.status(400).json({
        success: false,
        error: `Cannot add ${ownership_percentage}% ownership. Only ${(100 - currentOwnership).toFixed(2)}% available.`
      });
    }

    // Create investment
    const result = await pool.query(`
      INSERT INTO investments (
        investor_id, property_id, amount_invested, ownership_percentage,
        number_of_shares, investment_date, maturity_date, expected_annual_return,
        notes, created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
      RETURNING *
    `, [
      investor_id,
      property_id,
      amount_invested,
      ownership_percentage,
      number_of_shares,
      investment_date || new Date().toISOString().split('T')[0],
      maturity_date,
      expected_annual_return,
      notes,
      createdBy
    ]);

    const newInvestment = result.rows[0];

    // Update investor's total invested
    await pool.query(`
      UPDATE investment_investors
      SET total_invested = COALESCE(total_invested, 0) + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [amount_invested, investor_id]);

    // Log activity
    const investor = investorCheck.rows[0];
    const property = propertyCheck.rows[0];

    if (createdBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [createdBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'investment_created',
        `Created investment: ${investor.name} → ${property.title} (${ownership_percentage}%, €${amount_invested})`,
        createdBy,
        adminName,
        investor_id,
        property_id
      );
    }

    res.status(201).json({
      success: true,
      data: newInvestment,
      message: `Investment created: ${investor.name} now owns ${ownership_percentage}% of ${property.title}`
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/investment/investments/:id
 * Update investment
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount_invested,
      ownership_percentage,
      number_of_shares,
      expected_annual_return,
      actual_return_to_date,
      distributions_received,
      status,
      maturity_date,
      exit_date,
      exit_amount,
      exit_type,
      notes,
      updatedBy
    } = req.body;

    // Check if investment exists
    const checkResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const existingInvestment = checkResult.rows[0];

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (amount_invested !== undefined) {
      updates.push(`amount_invested = $${paramIndex}`);
      params.push(amount_invested);
      paramIndex++;
    }

    if (ownership_percentage !== undefined) {
      // Check total ownership
      const ownershipCheck = await pool.query(
        'SELECT COALESCE(SUM(ownership_percentage), 0) as total FROM investments WHERE property_id = $1 AND id != $2',
        [existingInvestment.property_id, id]
      );
      const otherOwnership = parseFloat(ownershipCheck.rows[0].total);
      if (otherOwnership + parseFloat(ownership_percentage) > 100) {
        return res.status(400).json({
          success: false,
          error: `Cannot set ${ownership_percentage}% ownership. Only ${(100 - otherOwnership).toFixed(2)}% available.`
        });
      }
      updates.push(`ownership_percentage = $${paramIndex}`);
      params.push(ownership_percentage);
      paramIndex++;
    }

    if (number_of_shares !== undefined) {
      updates.push(`number_of_shares = $${paramIndex}`);
      params.push(number_of_shares);
      paramIndex++;
    }

    if (expected_annual_return !== undefined) {
      updates.push(`expected_annual_return = $${paramIndex}`);
      params.push(expected_annual_return);
      paramIndex++;
    }

    if (actual_return_to_date !== undefined) {
      updates.push(`actual_return_to_date = $${paramIndex}`);
      params.push(actual_return_to_date);
      paramIndex++;
    }

    if (distributions_received !== undefined) {
      updates.push(`distributions_received = $${paramIndex}`);
      params.push(distributions_received);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (maturity_date !== undefined) {
      updates.push(`maturity_date = $${paramIndex}`);
      params.push(maturity_date);
      paramIndex++;
    }

    if (exit_date !== undefined) {
      updates.push(`exit_date = $${paramIndex}`);
      params.push(exit_date);
      paramIndex++;
    }

    if (exit_amount !== undefined) {
      updates.push(`exit_amount = $${paramIndex}`);
      params.push(exit_amount);
      paramIndex++;
    }

    if (exit_type !== undefined) {
      updates.push(`exit_type = $${paramIndex}`);
      params.push(exit_type);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE investments SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    // Log activity
    if (updatedBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [updatedBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'investment_updated',
        `Updated investment #${id}`,
        updatedBy,
        adminName,
        existingInvestment.investor_id,
        existingInvestment.property_id
      );
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/investment/investments/:id
 * Delete investment
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    const checkResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = checkResult.rows[0];

    // Update investor's total invested
    await pool.query(`
      UPDATE investment_investors
      SET total_invested = GREATEST(COALESCE(total_invested, 0) - $1, 0),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [investment.amount_invested, investment.investor_id]);

    // Delete investment
    await pool.query('DELETE FROM investments WHERE id = $1', [id]);

    // Log activity
    if (deletedBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [deletedBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'investment_deleted',
        `Deleted investment #${id}`,
        deletedBy,
        adminName,
        investment.investor_id,
        investment.property_id
      );
    }

    res.json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/investment/investments/:id/distribution
 * Record a distribution payment
 */
router.post('/:id/distribution', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, recordedBy } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Distribution amount must be greater than 0'
      });
    }

    const checkResult = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    // Update distributions and actual returns
    const result = await pool.query(`
      UPDATE investments
      SET distributions_received = COALESCE(distributions_received, 0) + $1,
          actual_return_to_date = COALESCE(actual_return_to_date, 0) + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [amount, id]);

    // Log activity
    if (recordedBy) {
      const adminResult = await pool.query('SELECT name FROM investment_admins WHERE id = $1', [recordedBy]);
      const adminName = adminResult.rows[0]?.name || 'System';
      await logActivity(
        'distribution_recorded',
        `Recorded €${amount} distribution for investment #${id}`,
        recordedBy,
        adminName,
        checkResult.rows[0].investor_id,
        checkResult.rows[0].property_id
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Distribution of €${amount} recorded successfully`
    });
  } catch (error) {
    console.error('Error recording distribution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/investment/investments/:id/calculate
 * Calculate detailed returns for an investment
 */
router.get('/:id/calculate', async (req, res) => {
  try {
    const { id } = req.params;
    const { projection_years } = req.query;

    const result = await pool.query(`
      SELECT
        i.*,
        inv.name as investor_name,
        p.title as property_title,
        p.total_value as property_total_value,
        COALESCE(CURRENT_DATE - i.investment_date::date, 0) as days_invested
      FROM investments i
      JOIN investment_investors inv ON i.investor_id = inv.id
      JOIN investment_properties p ON i.property_id = p.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const inv = result.rows[0];
    const amountInvested = parseFloat(inv.amount_invested);
    const expectedReturn = parseFloat(inv.expected_annual_return) || 0;
    const actualReturn = parseFloat(inv.actual_return_to_date) || 0;
    const daysInvested = parseInt(inv.days_invested);
    const yearsInvested = daysInvested / 365;

    // Current performance
    const expectedToDate = amountInvested * (expectedReturn / 100) * yearsInvested;
    const currentValue = amountInvested + actualReturn;
    const roiPercent = amountInvested > 0 ? (actualReturn / amountInvested) * 100 : 0;

    // Projections
    const projectionYears = parseInt(projection_years) || 5;
    const projections = [];

    for (let year = 1; year <= projectionYears; year++) {
      const projectedReturn = amountInvested * (expectedReturn / 100) * year;
      const projectedValue = amountInvested + projectedReturn;
      const annualDistribution = projectedReturn / year;

      projections.push({
        year,
        projected_value: Math.round(projectedValue * 100) / 100,
        projected_return: Math.round(projectedReturn * 100) / 100,
        annual_distribution: Math.round(annualDistribution * 100) / 100,
        cumulative_roi: Math.round((projectedReturn / amountInvested) * 100 * 100) / 100
      });
    }

    res.json({
      success: true,
      data: {
        investment: {
          id: inv.id,
          investor_name: inv.investor_name,
          property_title: inv.property_title,
          amount_invested: amountInvested,
          ownership_percentage: parseFloat(inv.ownership_percentage),
          expected_annual_return: expectedReturn,
          investment_date: inv.investment_date,
          maturity_date: inv.maturity_date
        },
        current_performance: {
          days_invested: daysInvested,
          years_invested: Math.round(yearsInvested * 100) / 100,
          expected_return_to_date: Math.round(expectedToDate * 100) / 100,
          actual_return_to_date: Math.round(actualReturn * 100) / 100,
          performance_vs_expected: Math.round((actualReturn - expectedToDate) * 100) / 100,
          current_value: Math.round(currentValue * 100) / 100,
          roi_percentage: Math.round(roiPercent * 100) / 100,
          status: actualReturn >= expectedToDate ? 'on_track' : 'below_target'
        },
        projections,
        summary: {
          break_even_years: expectedReturn > 0 ? Math.round((100 / expectedReturn) * 100) / 100 : null,
          double_value_years: expectedReturn > 0 ? Math.round((100 / expectedReturn) * 100) / 100 : null,
          estimated_annual_income: Math.round((amountInvested * expectedReturn / 100) * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Error calculating investment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
