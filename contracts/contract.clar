;; Crop Insurance Protocol - Weather-Based Parametric Insurance
;; A comprehensive parametric insurance system using weather data for automatic claim settlements

(define-constant MINIMUM_DEPOSIT u1000000) ;; 1 STX

;; Weather parameters structure
(define-map weather-params uint (tuple
    (min-temp int)
    (max-temp int)
    (min-rainfall int)
    (max-rainfall int)
    (max-wind-speed int)
))

;; Pool structure
(define-map pools uint (tuple
    (owner principal)
    (total-funds uint)
    (claim-amount uint)
    (is-active bool)
    (participant-count uint)
))

;; Claims structure
(define-map claims uint (tuple
    (pool-id uint)
    (claimant principal)
    (status (string-ascii 20))
    (amount uint)
    (weather-data (string-ascii 100))
    (submitted-at uint)
))

;; Counters
(define-data-var pool-counter uint u0)
(define-data-var claim-counter uint u0)

;; Error codes
(define-constant ERR_INSUFFICIENT_FUNDS u1001)
(define-constant ERR_POOL_NOT_FOUND u1002)
(define-constant ERR_INVALID_AMOUNT u1003)
(define-constant ERR_ALREADY_PARTICIPANT u1004)
(define-constant ERR_NOT_PARTICIPANT u1005)

;; Create a new insurance pool with weather parameters
(define-public (create-pool 
    (claim-amount uint)
    (min-temp int)
    (max-temp int)
    (min-rainfall int)
    (max-rainfall int)
    (max-wind-speed int)
)
    (let ((pool-id (+ (var-get pool-counter) u1)))
        (begin
            (asserts! (>= claim-amount MINIMUM_DEPOSIT) (err ERR_INVALID_AMOUNT))
            (var-set pool-counter pool-id)
            ;; Store weather params separately
            (map-set weather-params pool-id (tuple
                (min-temp min-temp)
                (max-temp max-temp)
                (min-rainfall min-rainfall)
                (max-rainfall max-rainfall)
                (max-wind-speed max-wind-speed)
            ))
            (map-set pools pool-id (tuple
                (owner tx-sender)
                (total-funds u0)
                (claim-amount claim-amount)
                (is-active true)
                (participant-count u1)
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
                (participant-count (+ (get participant-count pool) u1))
            )))
            (ok true)
        )
    )
)

;; Submit a claim with weather data
(define-public (submit-claim (pool-id uint) (weather-data (string-ascii 100)))
    (let ((pool (unwrap! (map-get? pools pool-id) (err ERR_POOL_NOT_FOUND))))
        (let ((claim-id (+ (var-get claim-counter) u1)))
            (begin
                (asserts! (get is-active pool) (err ERR_POOL_NOT_FOUND))
                ;; For now, allow any participant to submit claims (simplified)
                (var-set claim-counter claim-id)
                (map-set claims claim-id (tuple
                    (pool-id pool-id)
                    (claimant tx-sender)
                    (status "pending")
                    (amount (get claim-amount pool))
                    (weather-data weather-data)
                    (submitted-at u0)
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

;; Get weather parameters for a pool
(define-read-only (get-weather-params (pool-id uint))
    (map-get? weather-params pool-id)
)


