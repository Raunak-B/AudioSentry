# AWS ECS Fargate Logging Configuration

To achieve centralized observability, the DevOps team must configure the AWS ECS Task Definitions for the AudioSentry Engine and BFF to use the `awslogs` log driver. This enables seamless aggregation of structured JSON telemetry from our Fargate containers directly into AWS CloudWatch.

## Configuration Requirements

When updating the Terraform, CloudFormation, or AWS Console for the ECS Task Definitions, ensure the `logConfiguration` block is defined exactly as follows:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/audiosentry/production",
    "awslogs-region": "us-east-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

### Key Considerations:
- **CloudWatch Log Group**: Ensure the specified log group (`/ecs/audiosentry/production`) exists prior to deployment, or the Fargate task will fail to provision.
- **IAM Permissions**: The ECS Task Execution Role requires the `logs:CreateLogStream` and `logs:PutLogEvents` permissions to write data successfully.
- **JSON Parsing**: The Python Engine and Node BFF now emit strict JSON logs. You can query these directly using CloudWatch Logs Insights. For example:
  ```text
  fields @timestamp, call_id, acoustic_score, latency_ms
  | filter vad_bypass_events = 0
  | sort acoustic_score desc
  ```
