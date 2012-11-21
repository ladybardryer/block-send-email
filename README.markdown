# Send Email Action Block

## Example Usage

	curl -v -X OPTIONS http://block-send-email.herokuapp.com
	
	curl -i -X POST -d '{"input":{"to":"matt@matthewghudson.com","subject":"foo","body":"bar"}}' -H "Content-Type: application/json" http://block-send-email.herokuapp.com

