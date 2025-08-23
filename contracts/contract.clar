;; Crop Insurance Protocol - Simplified Version
;; A parametric insurance system using weather data for automatic claim settlements

(define-constant MINIMUM_DEPOSIT u1000000) ;; 1 STX

;; Simple pool structure
(define-map pools uint (tuple
    (owner principal)
    (total-funds uint)
    (claim-amount uint)
    (is-active bool)
))

;; Simple claims structure
(define-map claims uint (tuple
    (pool-id uint)
    (claimant principal)
    (status (string-ascii 20))
    (amount uint)
))

;; Counters
(define-data-var pool-counter uint u0)
(define-data-var claim-counter uint u0)

;; Error codes
(define-constant ERR_INSUFFICIENT_FUNDS u1001)
(define-constant ERR_POOL_NOT_FOUND u1002)
(define-constant ERR_INVALID_AMOUNT u1003)

;; Create a new insurance pool
(define-public (create-pool (claim-amount uint))
    (let ((pool-id (+ (var-get pool-counter) u1)))
        (begin
            (asserts! (>= claim-amount MINIMUM_DEPOSIT) (err ERR_INVALID_AMOUNT))
            (var-set pool-counter pool-id)
            (map-set pools pool-id (tuple
                (owner tx-sender)
                (total-funds u0)
                (claim-amount claim-amount)
                (is-active true)
            ))
            (ok pool-id)
        )
    )
)

;; Deposit funds to a pool
(define-public (deposit-funds (pool-id uint))
    (let ((pool (unwrap! (map-get? pools pool-id) (err ERR_POOL_NOT_FOUND))))
        (begin
            (asserts! (get is-active pool) (err ERR_POOL_NOT_FOUND))
            (asserts! (>= (stx-get-balance tx-sender) MINIMUM_DEPOSIT) (err ERR_INSUFFICIENT_FUNDS))
            (map-set pools pool-id (merge pool (tuple
                (total-funds (+ (get total-funds pool) MINIMUM_DEPOSIT))
            )))
            (ok true)
        )
    )
)

;; Submit a claim
(define-public (submit-claim (pool-id uint))
    (let ((pool (unwrap! (map-get? pools pool-id) (err ERR_POOL_NOT_FOUND))))
        (let ((claim-id (+ (var-get claim-counter) u1)))
            (begin
                (asserts! (get is-active pool) (err ERR_POOL_NOT_FOUND))
                (var-set claim-counter claim-id)
                (map-set claims claim-id (tuple
                    (pool-id pool-id)
                    (claimant tx-sender)
                    (status "pending")
                    (amount (get claim-amount pool))
                ))
                (ok claim-id)
            )
        )
    )
)

;; Get pool information
(define-read-only (get-pool (pool-id uint))
    (map-get? pools pool-id)
)

;; Get claim information
(define-read-only (get-claim (claim-id uint))
    (map-get? claims claim-id)
)

;; Get pool counter
(define-read-only (get-pool-counter)
    (var-get pool-counter)
)

;; Get claim counter
(define-read-only (get-claim-counter)
    (var-get claim-counter)
)
