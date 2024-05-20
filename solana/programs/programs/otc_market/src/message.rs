use anchor_lang::{prelude::Pubkey, AnchorDeserialize, AnchorSerialize};
use std::io;

const PAYLOAD_ID_ALIVE: u8 = 0;
const PAYLOAD_ID_HELLO: u8 = 1;
const PAYLOAD_ID_OFFER_CREATED: u8 = 2;

pub const HELLO_MESSAGE_MAX_LENGTH: usize = 512;

#[derive(Clone)]
/// Expected message types for this program. Only valid payloads are:
/// * `Alive`: Payload ID == 0. Emitted when [`initialize`](crate::initialize)
///  is called).
/// * `Hello`: Payload ID == 1. Emitted when
/// [`send_message`](crate::send_message) is called).
///
/// Payload IDs are encoded as u8.
pub enum OtcMarketMessage {
    Alive {
        program_id: Pubkey,
    },
    Hello {
        message: Vec<u8>,
    },
    OfferCreated {
        seller_source_address: [u8; 32],
        seller_target_address: [u8; 32],
        source_chain: u16,
        target_chain: u16,
        source_token_address: [u8; 32],
        target_token_address: [u8; 32],
        source_token_amount: u64,
        exchange_rate: u64,
    },
}

impl AnchorSerialize for OtcMarketMessage {
    fn serialize<W: io::Write>(&self, writer: &mut W) -> io::Result<()> {
        match self {
            OtcMarketMessage::Alive { program_id } => {
                PAYLOAD_ID_ALIVE.serialize(writer)?;
                program_id.serialize(writer)
            }
            OtcMarketMessage::Hello { message } => {
                if message.len() > HELLO_MESSAGE_MAX_LENGTH {
                    Err(io::Error::new(
                        io::ErrorKind::InvalidInput,
                        format!("message exceeds {HELLO_MESSAGE_MAX_LENGTH} bytes"),
                    ))
                } else {
                    PAYLOAD_ID_HELLO.serialize(writer)?;
                    (message.len() as u16).to_be_bytes().serialize(writer)?;
                    for item in message {
                        item.serialize(writer)?;
                    }
                    Ok(())
                }
            }
            OtcMarketMessage::OfferCreated {
                seller_source_address,
                seller_target_address,
                source_chain,
                target_chain,
                source_token_address,
                target_token_address,
                source_token_amount,
                exchange_rate,
            } => {
                // TODO: serialize differently ❓
                PAYLOAD_ID_OFFER_CREATED.serialize(writer)?;
                seller_source_address.serialize(writer)?;
                seller_target_address.serialize(writer)?;
                source_chain.serialize(writer)?;
                target_chain.serialize(writer)?;
                source_token_address.serialize(writer)?;
                target_token_address.serialize(writer)?;
                source_token_amount.serialize(writer)?;
                exchange_rate.serialize(writer)?;

                Ok(())
            }
        }
    }
}

impl AnchorDeserialize for OtcMarketMessage {
    fn deserialize(buf: &mut &[u8]) -> io::Result<Self> {
        match buf[0] {
            PAYLOAD_ID_ALIVE => Ok(OtcMarketMessage::Alive {
                program_id: Pubkey::try_from(&buf[1..33]).unwrap(),
            }),
            PAYLOAD_ID_HELLO => {
                let length = {
                    let mut out = [0u8; 2];
                    out.copy_from_slice(&buf[1..3]);
                    u16::from_be_bytes(out) as usize
                };
                if length > HELLO_MESSAGE_MAX_LENGTH {
                    Err(io::Error::new(
                        io::ErrorKind::InvalidInput,
                        format!("message exceeds {HELLO_MESSAGE_MAX_LENGTH} bytes"),
                    ))
                } else {
                    Ok(OtcMarketMessage::Hello {
                        message: buf[3..(3 + length)].to_vec(),
                    })
                }
            }
            PAYLOAD_ID_OFFER_CREATED => {
                // TODO: deserialize differently ❓
                let seller_source_address = {
                    let mut out = [0u8; 32];
                    out.copy_from_slice(&buf[1..33]);
                    out
                };
                let seller_target_address = {
                    let mut out = [0u8; 32];
                    out.copy_from_slice(&buf[33..65]);
                    out
                };
                let source_chain = {
                    let mut out = [0u8; 2];
                    out.copy_from_slice(&buf[65..67]);
                    u16::from_be_bytes(out)
                };
                let target_chain = {
                    let mut out = [0u8; 2];
                    out.copy_from_slice(&buf[67..69]);
                    u16::from_be_bytes(out)
                };
                let source_token_address = {
                    let mut out = [0u8; 32];
                    out.copy_from_slice(&buf[69..101]);
                    out
                };
                let target_token_address = {
                    let mut out = [0u8; 32];
                    out.copy_from_slice(&buf[101..133]);
                    out
                };
                let source_token_amount = {
                    let mut out = [0u8; 8];
                    out.copy_from_slice(&buf[133..141]);
                    u64::from_be_bytes(out)
                };
                let exchange_rate = {
                    let mut out = [0u8; 8];
                    out.copy_from_slice(&buf[141..149]);
                    u64::from_be_bytes(out)
                };
                Ok(OtcMarketMessage::OfferCreated {
                    seller_source_address,
                    seller_target_address,
                    source_chain,
                    target_chain,
                    source_token_address,
                    target_token_address,
                    source_token_amount,
                    exchange_rate,
                })
            }
            _ => Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "invalid payload ID",
            )),
        }
    }
}

#[cfg(test)]
pub mod test {
    use super::*;
    use anchor_lang::prelude::Result;
    use std::{mem::size_of, str, string::String};

    #[test]
    fn test_message_alive() -> Result<()> {
        let my_program_id = Pubkey::new_unique();
        let msg = OtcMarketMessage::Alive {
            program_id: my_program_id,
        };

        // Serialize program ID above.
        let mut encoded = Vec::new();
        msg.serialize(&mut encoded)?;

        assert_eq!(encoded.len(), size_of::<u8>() + size_of::<Pubkey>());

        // Verify Payload ID.
        assert_eq!(encoded[0], PAYLOAD_ID_ALIVE);

        // Verify Program ID.
        let mut program_id_bytes = [0u8; 32];
        program_id_bytes.copy_from_slice(&encoded[1..33]);
        assert_eq!(program_id_bytes, my_program_id.to_bytes());

        // Now deserialize the encoded message.
        match OtcMarketMessage::deserialize(&mut encoded.as_slice())? {
            OtcMarketMessage::Alive { program_id } => {
                assert_eq!(program_id, my_program_id)
            }
            _ => assert!(false, "incorrect deserialization"),
        }

        Ok(())
    }

    #[test]
    fn test_message_hello() -> Result<()> {
        let raw_message = String::from("All your base are belong to us");
        let msg = OtcMarketMessage::Hello {
            message: raw_message.as_bytes().to_vec(),
        };

        // Serialize message above.
        let mut encoded = Vec::new();
        msg.serialize(&mut encoded)?;

        assert_eq!(
            encoded.len(),
            size_of::<u8>() + size_of::<u16>() + raw_message.len()
        );

        // Verify Payload ID.
        assert_eq!(encoded[0], PAYLOAD_ID_HELLO);

        // Verify message length.
        let mut message_len_bytes = [0u8; 2];
        message_len_bytes.copy_from_slice(&encoded[1..3]);
        assert_eq!(
            u16::from_be_bytes(message_len_bytes) as usize,
            raw_message.len()
        );

        // Verify message.
        let from_utf8_result = str::from_utf8(&encoded[3..]);
        assert!(from_utf8_result.is_ok(), "from_utf8 resulted in an error");
        assert_eq!(from_utf8_result.unwrap(), raw_message);

        // Now deserialize the encoded message.
        match OtcMarketMessage::deserialize(&mut encoded.as_slice())? {
            OtcMarketMessage::Hello { message } => {
                assert_eq!(message, raw_message.as_bytes())
            }
            _ => assert!(false, "incorrect deserialization"),
        }

        Ok(())
    }

    #[test]
    fn test_message_hello_too_large() -> Result<()> {
        let n: usize = 513;
        let raw_message = {
            let mut out = Vec::with_capacity(n);
            for _ in 0..n {
                out.push(33u8)
            }
            String::from_utf8(out).unwrap()
        };
        let msg = OtcMarketMessage::Hello {
            message: raw_message.as_bytes().to_vec(),
        };

        // Attempt to serialize message above.
        let mut encoded = Vec::new();
        match msg.serialize(&mut encoded) {
            Err(e) => assert_eq!(e.kind(), io::ErrorKind::InvalidInput),
            _ => assert!(false, "not supposed to serialize"),
        };

        // Serialize manually and then attempt to deserialize.
        encoded.push(PAYLOAD_ID_HELLO);
        encoded.extend_from_slice(&(raw_message.len() as u16).to_be_bytes());
        encoded.extend_from_slice(raw_message.as_bytes());

        assert_eq!(
            encoded.len(),
            size_of::<u8>() + size_of::<u16>() + raw_message.len()
        );

        // Verify Payload ID.
        assert_eq!(encoded[0], PAYLOAD_ID_HELLO);

        // Verify message length.
        let mut message_len_bytes = [0u8; 2];
        message_len_bytes.copy_from_slice(&encoded[1..3]);
        assert_eq!(
            u16::from_be_bytes(message_len_bytes) as usize,
            raw_message.len()
        );

        match OtcMarketMessage::deserialize(&mut encoded.as_slice()) {
            Err(e) => assert_eq!(e.kind(), io::ErrorKind::InvalidInput),
            _ => assert!(false, "not supposed to deserialize"),
        };

        Ok(())
    }

    // TODO: test_message_offer_created
}
