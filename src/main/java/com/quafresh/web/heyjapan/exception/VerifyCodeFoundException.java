package com.quafresh.web.heyjapan.exception;

public class VerifyCodeFoundException extends RuntimeException {

    public enum Reason {
        NOT_FOUND, EXPIRED
    }

    private final Reason reason;

    public VerifyCodeFoundException(String message, Reason reason) {
        super(message);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
