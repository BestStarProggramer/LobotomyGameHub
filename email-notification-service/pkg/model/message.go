package model

type Message struct {
	Type           string                 `json:"type"`
	RecipientEmail string                 `json:"recipient_email"`
	Data           map[string]interface{} `json:"data"`
}
