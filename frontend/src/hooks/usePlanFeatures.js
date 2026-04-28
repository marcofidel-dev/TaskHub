import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptions } from '../services/api';

export function usePlanFeatures() {
  const { user } = useAuth();
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFeatures = async () => {
      try {
        const response = await subscriptions.current();
        const featureMap = {};
        if (response.data.features) {
          response.data.features.forEach(feature => {
            featureMap[feature] = true;
          });
        }
        setFeatures(featureMap);
      } catch (err) {
        console.error('Failed to load features:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [user]);

  return {
    canUseFeature: (featureName) => !!features[featureName],
    features,
    loading
  };
}
