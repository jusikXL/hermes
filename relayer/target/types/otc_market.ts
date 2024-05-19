export type OtcMarket = {
  "version": "0.1.0",
  "name": "otc_market",
  "docs": [
    "# Hello World (Scaffolding Example #1)",
    "",
    "## Program Accounts",
    "* [Config]",
    "* [ForeignEmitter]",
    "* [Received]",
    "* [WormholeEmitter]"
  ],
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "See [initialize]."
      ],
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Whoever initializes the config will be the owner of the program. Signer",
            "for creating the [`Config`] account and posting a Wormhole message",
            "indicating that the program is alive."
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Config account, which saves program data useful for other instructions.",
            "Also saves the payer of the [`initialize`](crate::initialize) instruction",
            "as the program's owner."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Wormhole program."
          ]
        },
        {
          "name": "wormholeBridge",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole bridge data account (a.k.a. its config).",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "wormholeFeeCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole fee collector account, which requires lamports before the",
            "program can post a message (if there is a fee).",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "wormholeEmitter",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "This program's emitter account. We create this account in the",
            "[`initialize`](crate::initialize) instruction, but",
            "[`wormhole::post_message`] only needs it to be read-only."
          ]
        },
        {
          "name": "wormholeSequence",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "message is posted, so it needs to be an [UncheckedAccount] for the",
            "[`initialize`](crate::initialize) instruction.",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "wormholeMessage",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account, which requires this program's signature.",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Clock sysvar."
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Rent sysvar."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "registerEmitter",
      "docs": [
        "See [register_emitter]."
      ],
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Owner of the program set in the [`Config`] account. Signer for creating",
            "the [`ForeignEmitter`] account."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. This program requires that the `owner` specified in the",
            "context equals the pubkey specified in this account. Read-only."
          ]
        },
        {
          "name": "foreignEmitter",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Foreign Emitter account. Create this account if an emitter has not been",
            "registered yet for this Wormhole chain ID. If there already is an",
            "emitter address saved in this account, overwrite it."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "chain",
          "type": "u16"
        },
        {
          "name": "address",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "sendMessage",
      "docs": [
        "See [send_message]."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Payer will pay Wormhole fee to post a message."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. Wormhole PDAs specified in the config are checked",
            "against the Wormhole accounts in this context. Read-only."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Wormhole program."
          ]
        },
        {
          "name": "wormholeBridge",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole bridge data. [`wormhole::post_message`] requires this account",
            "be mutable."
          ]
        },
        {
          "name": "wormholeFeeCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole fee collector. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Program's emitter account. Read-only."
          ]
        },
        {
          "name": "wormholeSequence",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Emitter's sequence account. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeMessage",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account be mutable."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Clock sysvar."
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Rent sysvar."
          ]
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "createOffer",
      "docs": [
        "See [create_offer]."
      ],
      "accounts": [
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Seller will pay Wormhole fee to post a message."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. Wormhole PDAs specified in the config are checked",
            "against the Wormhole accounts in this context. Read-only."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Wormhole program."
          ]
        },
        {
          "name": "wormholeBridge",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole bridge data. [`wormhole::post_message`] requires this account",
            "be mutable."
          ]
        },
        {
          "name": "wormholeFeeCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole fee collector. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Program's emitter account. Read-only."
          ]
        },
        {
          "name": "wormholeSequence",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Emitter's sequence account. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeMessage",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account be mutable."
          ]
        },
        {
          "name": "foreignEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Foreign emitter account.",
            "Read-only."
          ]
        },
        {
          "name": "sellerAta",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "seller ata"
          ]
        },
        {
          "name": "sourceToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "escrow ata"
          ]
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Offer account."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token program."
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Clock sysvar."
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Rent sysvar."
          ]
        }
      ],
      "args": [
        {
          "name": "targetChain",
          "type": "u16"
        },
        {
          "name": "sellerTargetAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "targetTokenAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "sourceTokenAmount",
          "type": "u64"
        },
        {
          "name": "exchangeRate",
          "type": "u64"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "receiveMessage",
      "docs": [
        "See [receive_message]."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Payer will initialize an account that tracks his own message IDs."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. Wormhole PDAs specified in the config are checked",
            "against the Wormhole accounts in this context. Read-only."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "posted",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Verified Wormhole message account. The Wormhole program verified",
            "signatures and posted the account data here. Read-only."
          ]
        },
        {
          "name": "foreignEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Foreign emitter account. The posted message's `emitter_address` must",
            "agree with the one we have registered for this message's `emitter_chain`",
            "(chain ID). Read-only."
          ]
        },
        {
          "name": "received",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Received account. [`receive_message`](crate::receive_message) will",
            "deserialize the Wormhole message's payload and save it to this account.",
            "This account cannot be overwritten, and will prevent Wormhole message",
            "replay with the same sequence."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "vaaHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "docs": [
        "Config account data."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Program's owner."
            ],
            "type": "publicKey"
          },
          {
            "name": "wormhole",
            "docs": [
              "Wormhole program's relevant addresses."
            ],
            "type": {
              "defined": "WormholeAddresses"
            }
          },
          {
            "name": "batchId",
            "docs": [
              "AKA nonce. Just zero, but saving this information in this account",
              "anyway."
            ],
            "type": "u32"
          },
          {
            "name": "finality",
            "docs": [
              "AKA consistency level. u8 representation of Solana's",
              "[Finality](wormhole_anchor_sdk::wormhole::Finality)."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "foreignEmitter",
      "docs": [
        "Foreign emitter account data."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chain",
            "docs": [
              "Emitter chain. Cannot equal `1` (Solana's Chain ID)."
            ],
            "type": "u16"
          },
          {
            "name": "address",
            "docs": [
              "Emitter address. Cannot be zero address."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "offer",
      "docs": [
        "Offer account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "sellerSourceAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sellerTargetAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceChain",
            "type": "u16"
          },
          {
            "name": "targetChain",
            "type": "u16"
          },
          {
            "name": "sourceTokenAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "targetTokenAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceTokenAmount",
            "type": "u64"
          },
          {
            "name": "exchangeRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "received",
      "docs": [
        "Received account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchId",
            "docs": [
              "AKA nonce. Should always be zero in this example, but we save it anyway."
            ],
            "type": "u32"
          },
          {
            "name": "wormholeMessageHash",
            "docs": [
              "Keccak256 hash of verified Wormhole message."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "message",
            "docs": [
              "OtcMarketMessage from [OtcMarketMessage::Hello](crate::message::OtcMarketMessage)."
            ],
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "wormholeEmitter",
      "docs": [
        "Wormhole emitter account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WormholeAddresses",
      "docs": [
        "Wormhole program related addresses."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bridge",
            "docs": [
              "[BridgeData](wormhole_anchor_sdk::wormhole::BridgeData) address."
            ],
            "type": "publicKey"
          },
          {
            "name": "feeCollector",
            "docs": [
              "[FeeCollector](wormhole_anchor_sdk::wormhole::FeeCollector) address."
            ],
            "type": "publicKey"
          },
          {
            "name": "sequence",
            "docs": [
              "[SequenceTracker](wormhole_anchor_sdk::wormhole::SequenceTracker) address."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "OtcMarketMessage",
      "docs": [
        "Expected message types for this program. Only valid payloads are:",
        "* `Alive`: Payload ID == 0. Emitted when [`initialize`](crate::initialize)",
        "is called).",
        "* `Hello`: Payload ID == 1. Emitted when",
        "[`send_message`](crate::send_message) is called).",
        "",
        "Payload IDs are encoded as u8."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Alive",
            "fields": [
              {
                "name": "program_id",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "Hello",
            "fields": [
              {
                "name": "message",
                "type": "bytes"
              }
            ]
          },
          {
            "name": "OfferCreated",
            "fields": [
              {
                "name": "seller_source_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "seller_target_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "source_chain",
                "type": "u16"
              },
              {
                "name": "target_chain",
                "type": "u16"
              },
              {
                "name": "source_token_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "target_token_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "source_token_amount",
                "type": "u64"
              },
              {
                "name": "exchange_rate",
                "type": "u64"
              }
            ]
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OfferCreated",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "sellerSourceAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "sellerTargetAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "sourceChain",
          "type": "u16",
          "index": false
        },
        {
          "name": "targetChain",
          "type": "u16",
          "index": false
        },
        {
          "name": "sourceTokenAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "targetTokenAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "sourceTokenAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "exchangeRate",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidWormholeConfig",
      "msg": "InvalidWormholeConfig"
    },
    {
      "code": 6001,
      "name": "InvalidWormholeFeeCollector",
      "msg": "InvalidWormholeFeeCollector"
    },
    {
      "code": 6002,
      "name": "InvalidWormholeEmitter",
      "msg": "InvalidWormholeEmitter"
    },
    {
      "code": 6003,
      "name": "InvalidWormholeSequence",
      "msg": "InvalidWormholeSequence"
    },
    {
      "code": 6004,
      "name": "InvalidSysvar",
      "msg": "InvalidSysvar"
    },
    {
      "code": 6005,
      "name": "OwnerOnly",
      "msg": "OwnerOnly"
    },
    {
      "code": 6006,
      "name": "InvalidForeignEmitter",
      "msg": "InvalidForeignEmitter"
    },
    {
      "code": 6007,
      "name": "BumpNotFound",
      "msg": "BumpNotFound"
    },
    {
      "code": 6008,
      "name": "InvalidMessage",
      "msg": "InvalidMessage"
    },
    {
      "code": 6009,
      "name": "InsufficientAmount",
      "msg": "InsufficientAmount"
    },
    {
      "code": 6010,
      "name": "InsufficientRate",
      "msg": "InsufficientRate"
    }
  ]
};

export const IDL: OtcMarket = {
  "version": "0.1.0",
  "name": "otc_market",
  "docs": [
    "# Hello World (Scaffolding Example #1)",
    "",
    "## Program Accounts",
    "* [Config]",
    "* [ForeignEmitter]",
    "* [Received]",
    "* [WormholeEmitter]"
  ],
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "See [initialize]."
      ],
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Whoever initializes the config will be the owner of the program. Signer",
            "for creating the [`Config`] account and posting a Wormhole message",
            "indicating that the program is alive."
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Config account, which saves program data useful for other instructions.",
            "Also saves the payer of the [`initialize`](crate::initialize) instruction",
            "as the program's owner."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Wormhole program."
          ]
        },
        {
          "name": "wormholeBridge",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole bridge data account (a.k.a. its config).",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "wormholeFeeCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole fee collector account, which requires lamports before the",
            "program can post a message (if there is a fee).",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "wormholeEmitter",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "This program's emitter account. We create this account in the",
            "[`initialize`](crate::initialize) instruction, but",
            "[`wormhole::post_message`] only needs it to be read-only."
          ]
        },
        {
          "name": "wormholeSequence",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "message is posted, so it needs to be an [UncheckedAccount] for the",
            "[`initialize`](crate::initialize) instruction.",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "wormholeMessage",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account, which requires this program's signature.",
            "[`wormhole::post_message`] requires this account be mutable."
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Clock sysvar."
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Rent sysvar."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "registerEmitter",
      "docs": [
        "See [register_emitter]."
      ],
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Owner of the program set in the [`Config`] account. Signer for creating",
            "the [`ForeignEmitter`] account."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. This program requires that the `owner` specified in the",
            "context equals the pubkey specified in this account. Read-only."
          ]
        },
        {
          "name": "foreignEmitter",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Foreign Emitter account. Create this account if an emitter has not been",
            "registered yet for this Wormhole chain ID. If there already is an",
            "emitter address saved in this account, overwrite it."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "chain",
          "type": "u16"
        },
        {
          "name": "address",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "sendMessage",
      "docs": [
        "See [send_message]."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Payer will pay Wormhole fee to post a message."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. Wormhole PDAs specified in the config are checked",
            "against the Wormhole accounts in this context. Read-only."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Wormhole program."
          ]
        },
        {
          "name": "wormholeBridge",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole bridge data. [`wormhole::post_message`] requires this account",
            "be mutable."
          ]
        },
        {
          "name": "wormholeFeeCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole fee collector. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Program's emitter account. Read-only."
          ]
        },
        {
          "name": "wormholeSequence",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Emitter's sequence account. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeMessage",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account be mutable."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Clock sysvar."
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Rent sysvar."
          ]
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "createOffer",
      "docs": [
        "See [create_offer]."
      ],
      "accounts": [
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Seller will pay Wormhole fee to post a message."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. Wormhole PDAs specified in the config are checked",
            "against the Wormhole accounts in this context. Read-only."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Wormhole program."
          ]
        },
        {
          "name": "wormholeBridge",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole bridge data. [`wormhole::post_message`] requires this account",
            "be mutable."
          ]
        },
        {
          "name": "wormholeFeeCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Wormhole fee collector. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Program's emitter account. Read-only."
          ]
        },
        {
          "name": "wormholeSequence",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Emitter's sequence account. [`wormhole::post_message`] requires this",
            "account be mutable."
          ]
        },
        {
          "name": "wormholeMessage",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account be mutable."
          ]
        },
        {
          "name": "foreignEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Foreign emitter account.",
            "Read-only."
          ]
        },
        {
          "name": "sellerAta",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "seller ata"
          ]
        },
        {
          "name": "sourceToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "escrow ata"
          ]
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Offer account."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token program."
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Clock sysvar."
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Rent sysvar."
          ]
        }
      ],
      "args": [
        {
          "name": "targetChain",
          "type": "u16"
        },
        {
          "name": "sellerTargetAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "targetTokenAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "sourceTokenAmount",
          "type": "u64"
        },
        {
          "name": "exchangeRate",
          "type": "u64"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "receiveMessage",
      "docs": [
        "See [receive_message]."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Payer will initialize an account that tracks his own message IDs."
          ]
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Config account. Wormhole PDAs specified in the config are checked",
            "against the Wormhole accounts in this context. Read-only."
          ]
        },
        {
          "name": "wormholeProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "posted",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Verified Wormhole message account. The Wormhole program verified",
            "signatures and posted the account data here. Read-only."
          ]
        },
        {
          "name": "foreignEmitter",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Foreign emitter account. The posted message's `emitter_address` must",
            "agree with the one we have registered for this message's `emitter_chain`",
            "(chain ID). Read-only."
          ]
        },
        {
          "name": "received",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Received account. [`receive_message`](crate::receive_message) will",
            "deserialize the Wormhole message's payload and save it to this account.",
            "This account cannot be overwritten, and will prevent Wormhole message",
            "replay with the same sequence."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "vaaHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "docs": [
        "Config account data."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Program's owner."
            ],
            "type": "publicKey"
          },
          {
            "name": "wormhole",
            "docs": [
              "Wormhole program's relevant addresses."
            ],
            "type": {
              "defined": "WormholeAddresses"
            }
          },
          {
            "name": "batchId",
            "docs": [
              "AKA nonce. Just zero, but saving this information in this account",
              "anyway."
            ],
            "type": "u32"
          },
          {
            "name": "finality",
            "docs": [
              "AKA consistency level. u8 representation of Solana's",
              "[Finality](wormhole_anchor_sdk::wormhole::Finality)."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "foreignEmitter",
      "docs": [
        "Foreign emitter account data."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chain",
            "docs": [
              "Emitter chain. Cannot equal `1` (Solana's Chain ID)."
            ],
            "type": "u16"
          },
          {
            "name": "address",
            "docs": [
              "Emitter address. Cannot be zero address."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "offer",
      "docs": [
        "Offer account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "sellerSourceAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sellerTargetAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceChain",
            "type": "u16"
          },
          {
            "name": "targetChain",
            "type": "u16"
          },
          {
            "name": "sourceTokenAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "targetTokenAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceTokenAmount",
            "type": "u64"
          },
          {
            "name": "exchangeRate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "received",
      "docs": [
        "Received account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchId",
            "docs": [
              "AKA nonce. Should always be zero in this example, but we save it anyway."
            ],
            "type": "u32"
          },
          {
            "name": "wormholeMessageHash",
            "docs": [
              "Keccak256 hash of verified Wormhole message."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "message",
            "docs": [
              "OtcMarketMessage from [OtcMarketMessage::Hello](crate::message::OtcMarketMessage)."
            ],
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "wormholeEmitter",
      "docs": [
        "Wormhole emitter account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WormholeAddresses",
      "docs": [
        "Wormhole program related addresses."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bridge",
            "docs": [
              "[BridgeData](wormhole_anchor_sdk::wormhole::BridgeData) address."
            ],
            "type": "publicKey"
          },
          {
            "name": "feeCollector",
            "docs": [
              "[FeeCollector](wormhole_anchor_sdk::wormhole::FeeCollector) address."
            ],
            "type": "publicKey"
          },
          {
            "name": "sequence",
            "docs": [
              "[SequenceTracker](wormhole_anchor_sdk::wormhole::SequenceTracker) address."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "OtcMarketMessage",
      "docs": [
        "Expected message types for this program. Only valid payloads are:",
        "* `Alive`: Payload ID == 0. Emitted when [`initialize`](crate::initialize)",
        "is called).",
        "* `Hello`: Payload ID == 1. Emitted when",
        "[`send_message`](crate::send_message) is called).",
        "",
        "Payload IDs are encoded as u8."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Alive",
            "fields": [
              {
                "name": "program_id",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "Hello",
            "fields": [
              {
                "name": "message",
                "type": "bytes"
              }
            ]
          },
          {
            "name": "OfferCreated",
            "fields": [
              {
                "name": "seller_source_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "seller_target_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "source_chain",
                "type": "u16"
              },
              {
                "name": "target_chain",
                "type": "u16"
              },
              {
                "name": "source_token_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "target_token_address",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              },
              {
                "name": "source_token_amount",
                "type": "u64"
              },
              {
                "name": "exchange_rate",
                "type": "u64"
              }
            ]
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OfferCreated",
      "fields": [
        {
          "name": "offerId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "sellerSourceAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "sellerTargetAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "sourceChain",
          "type": "u16",
          "index": false
        },
        {
          "name": "targetChain",
          "type": "u16",
          "index": false
        },
        {
          "name": "sourceTokenAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "targetTokenAddress",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "sourceTokenAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "exchangeRate",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidWormholeConfig",
      "msg": "InvalidWormholeConfig"
    },
    {
      "code": 6001,
      "name": "InvalidWormholeFeeCollector",
      "msg": "InvalidWormholeFeeCollector"
    },
    {
      "code": 6002,
      "name": "InvalidWormholeEmitter",
      "msg": "InvalidWormholeEmitter"
    },
    {
      "code": 6003,
      "name": "InvalidWormholeSequence",
      "msg": "InvalidWormholeSequence"
    },
    {
      "code": 6004,
      "name": "InvalidSysvar",
      "msg": "InvalidSysvar"
    },
    {
      "code": 6005,
      "name": "OwnerOnly",
      "msg": "OwnerOnly"
    },
    {
      "code": 6006,
      "name": "InvalidForeignEmitter",
      "msg": "InvalidForeignEmitter"
    },
    {
      "code": 6007,
      "name": "BumpNotFound",
      "msg": "BumpNotFound"
    },
    {
      "code": 6008,
      "name": "InvalidMessage",
      "msg": "InvalidMessage"
    },
    {
      "code": 6009,
      "name": "InsufficientAmount",
      "msg": "InsufficientAmount"
    },
    {
      "code": 6010,
      "name": "InsufficientRate",
      "msg": "InsufficientRate"
    }
  ]
};
