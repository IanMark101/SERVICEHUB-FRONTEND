import Skeleton from '../../ui/Skeleton';
import subscription from './Subscription.module.css';
import pricing from './ProviderPricing.module.css';
import styles from './SubscriptionSkeleton.module.css';

/** Reserves the same summary, pricing and history layout while membership data loads. */
export default function SubscriptionSkeleton() {
  return (
    <div className={styles.root} role="status" aria-label="Loading your subscription" aria-busy="true">
      <div className={styles.layout} aria-hidden="true">
        <div className={subscription.membership}>
          <div className={subscription.membershipHeading}>
            <div className={styles.currentPlan}>
              <Skeleton className={styles.label} />
              <Skeleton className={styles.currentTitle} />
            </div>
            <Skeleton className={styles.status} />
          </div>
          <div className={subscription.membershipFacts}>
            {[0, 1, 2, 3].map(fact => (
              <div className={styles.fact} key={fact}>
                <Skeleton className={styles.label} />
                <Skeleton className={styles.value} />
              </div>
            ))}
          </div>
          <Skeleton className={styles.footnote} />
        </div>

        <div className={pricing.pricing}>
          <div className={pricing.intro}>
            <Skeleton className={styles.title} />
            <Skeleton className={styles.subtitle} />
          </div>
          <div className={pricing.cards}>
            {[0, 1, 2].map(plan => (
              <div className={pricing.card} key={plan}>
                <div className={pricing.top}><Skeleton className={styles.planTitle} /></div>
                <div className={`${pricing.description} ${styles.description}`}>
                  <Skeleton className={styles.descriptionLine} />
                  <Skeleton className={styles.descriptionEnd} />
                </div>
                <div className={pricing.price}>
                  <Skeleton className={styles.price} />
                  <Skeleton className={styles.billing} />
                </div>
                <div className={pricing.action}><Skeleton className={styles.action} /></div>
                <div className={pricing.features}>
                  <div className={`${pricing.fee} ${styles.fee}`}>
                    <Skeleton className={styles.feeValue} />
                    <Skeleton className={styles.feeLabel} />
                  </div>
                  <div className={styles.featureList}>
                    {[0, 1, 2, 3].map(feature => (
                      <div className={styles.feature} key={feature}>
                        <Skeleton variant="circular" className={styles.icon} />
                        <Skeleton className={feature % 2 ? styles.featureShort : styles.featureLine} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Skeleton className={styles.note} />
          <div className={pricing.comparison}><Skeleton className={styles.comparison} /></div>
        </div>

        <div className={subscription.history}>
          <Skeleton className={styles.historyTitle} />
          <Skeleton className={styles.historyLine} />
        </div>
      </div>
    </div>
  );
}
