const axios = require('axios');

/**
 * ReliefWeb API Service
 * Fetches disaster and emergency data for Nepal
 * API Documentation: https://apidoc.rwlabs.org/
 */

const RELIEFWEB_API_BASE = 'https://api.reliefweb.int/v1';

/**
 * Get recent disasters in Nepal
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of results to return
 * @param {string} options.country - Country ISO3 code (default: NPL for Nepal)
 * @param {Date} options.fromDate - Start date for filtering
 * @returns {Promise<Array>} Array of disaster reports
 */
async function getDisasters(options = {}) {
  const {
    limit = 10,
    country = 'NPL', // Nepal ISO3 code
    fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  } = options;

  try {
    const response = await axios.post(
      `${RELIEFWEB_API_BASE}/reports`,
      {
        appname: 'voicelink',
        filter: {
          operator: 'AND',
          conditions: [
            {
              field: 'primary_country.iso3',
              value: country,
            },
            {
              field: 'date.created',
              value: {
                from: fromDate.toISOString(),
              },
            },
            {
              field: 'format.name',
              value: ['Alert', 'News and Press Release', 'Situation Report'],
            },
          ],
        },
        fields: {
          include: [
            'id',
            'title',
            'url',
            'date',
            'source',
            'format',
            'country',
            'disaster',
            'disaster_type',
            'theme',
            'body-html',
            'file',
          ],
        },
        limit,
        sort: ['date.created:desc'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching disasters from ReliefWeb:', error.message);
    throw error;
  }
}

/**
 * Get active disasters (ongoing emergencies)
 * @param {string} country - Country ISO3 code
 * @returns {Promise<Array>} Array of active disasters
 */
async function getActiveDisasters(country = 'NPL') {
  try {
    const response = await axios.post(
      `${RELIEFWEB_API_BASE}/disasters`,
      {
        appname: 'voicelink',
        filter: {
          operator: 'AND',
          conditions: [
            {
              field: 'country.iso3',
              value: country,
            },
            {
              field: 'status',
              value: 'ongoing',
            },
          ],
        },
        fields: {
          include: [
            'id',
            'name',
            'url',
            'date',
            'status',
            'country',
            'type',
            'glide',
            'description',
          ],
        },
        limit: 20,
        sort: ['date.created:desc'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching active disasters:', error.message);
    throw error;
  }
}

/**
 * Check for new disasters since last check
 * @param {Date} lastCheckTime - Last time we checked for disasters
 * @param {string} country - Country ISO3 code
 * @returns {Promise<Array>} Array of new disaster reports
 */
async function getNewDisastersSince(lastCheckTime, country = 'NPL') {
  try {
    const disasters = await getDisasters({
      limit: 50,
      country,
      fromDate: lastCheckTime,
    });

    // Filter for critical disaster types
    const criticalTypes = [
      'Earthquake',
      'Flood',
      'Landslide',
      'Epidemic',
      'Storm',
      'Fire',
      'Cold Wave',
      'Drought',
    ];

    return disasters.filter((disaster) => {
      const disasterTypes = disaster.fields?.disaster_type || [];
      return disasterTypes.some((type) =>
        criticalTypes.some((critical) =>
          type.name?.toLowerCase().includes(critical.toLowerCase())
        )
      );
    });
  } catch (error) {
    console.error('Error checking for new disasters:', error.message);
    throw error;
  }
}

/**
 * Format disaster data for SMS alert
 * @param {Object} disaster - Disaster object from ReliefWeb
 * @returns {string} Formatted SMS message
 */
function formatDisasterForSMS(disaster) {
  const title = disaster.fields?.title || 'Emergency Alert';
  const disasterType =
    disaster.fields?.disaster_type?.[0]?.name || 'Disaster';
  const source = disaster.fields?.source?.[0]?.shortname || 'ReliefWeb';
  const date = new Date(disaster.fields?.date?.created).toLocaleDateString();

  // Keep SMS under 160 characters
  const message = `ALERT: ${disasterType} - ${title.substring(0, 80)}. Source: ${source}. Date: ${date}. Stay safe.`;

  return message.substring(0, 160);
}

/**
 * Get disaster statistics for dashboard
 * @param {string} country - Country ISO3 code
 * @returns {Promise<Object>} Disaster statistics
 */
async function getDisasterStats(country = 'NPL') {
  try {
    const [activeDisasters, recentReports] = await Promise.all([
      getActiveDisasters(country),
      getDisasters({ limit: 30, country }),
    ]);

    const stats = {
      activeDisasters: activeDisasters.length,
      recentReports: recentReports.length,
      last24Hours: recentReports.filter((report) => {
        const created = new Date(report.fields?.date?.created);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return created > dayAgo;
      }).length,
      disasterTypes: {},
    };

    // Count disaster types
    recentReports.forEach((report) => {
      const types = report.fields?.disaster_type || [];
      types.forEach((type) => {
        const typeName = type.name;
        stats.disasterTypes[typeName] =
          (stats.disasterTypes[typeName] || 0) + 1;
      });
    });

    return stats;
  } catch (error) {
    console.error('Error getting disaster stats:', error.message);
    throw error;
  }
}

module.exports = {
  getDisasters,
  getActiveDisasters,
  getNewDisastersSince,
  formatDisasterForSMS,
  getDisasterStats,
};
