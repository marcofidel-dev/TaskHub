package com.taskhub.exception;

public class PlanLimitExceededException extends RuntimeException {

    private final String limitType;
    private final Integer current;
    private final Integer limit;
    private final String plan;
    private final String upgradeTo;

    public PlanLimitExceededException(String limitType, Integer current, Integer limit, String plan, String upgradeTo) {
        super(String.format("Plan limit exceeded: %s (%d/%d) in %s plan", limitType, current, limit, plan));
        this.limitType = limitType;
        this.current = current;
        this.limit = limit;
        this.plan = plan;
        this.upgradeTo = upgradeTo;
    }

    public String getLimitType() { return limitType; }
    public Integer getCurrent() { return current; }
    public Integer getLimit() { return limit; }
    public String getPlan() { return plan; }
    public String getUpgradeTo() { return upgradeTo; }
}
