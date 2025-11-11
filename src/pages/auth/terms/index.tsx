// src/pages/auth/terms/index.tsx
import { Container, Title, Text, Stack, Paper, Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { paths } from '@/routes';

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <Container size="md" py={40}>
      <Stack gap="lg">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(paths.auth.register)}
        >
          Back to Register
        </Button>

        <div>
          <Title order={1} mb="xs">
            Terms of Service
          </Title>
          <Text c="dimmed" fz="sm">
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </div>

        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={2} size="h4" mb="sm">
                1. Agreement to Terms
              </Title>
              <Text>
                By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                2. Use License
              </Title>
              <Text>
                Permission is granted to temporarily download one copy of the materials (information or software) on our application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </Text>
              <Stack gap="xs" mt="sm" ml="lg">
                <Text component="p">• Modifying or copying the materials</Text>
                <Text component="p">• Using the materials for any commercial purpose or for any public display</Text>
                <Text component="p">• Attempting to decompile or reverse engineer any software contained on the application</Text>
                <Text component="p">• Removing any copyright or other proprietary notations from the materials</Text>
                <Text component="p">• Transferring the materials to another person or "mirroring" the materials on any other server</Text>
              </Stack>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                3. Disclaimer
              </Title>
              <Text>
                The materials on our application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                4. Limitations
              </Title>
              <Text>
                In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our application, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                5. Accuracy of Materials
              </Title>
              <Text>
                The materials appearing on our application could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our application are accurate, complete, or current. We may make changes to the materials contained on our application at any time without notice.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                6. Links
              </Title>
              <Text>
                We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                7. Modifications
              </Title>
              <Text>
                We may revise these terms of service for our application at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                8. Governing Law
              </Title>
              <Text>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the company is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </Text>
            </div>

            <div>
              <Title order={2} size="h4" mb="sm">
                9. Contact Us
              </Title>
              <Text>
                If you have any questions about these Terms of Service, please contact us at support@example.com.
              </Text>
            </div>
          </Stack>
        </Paper>

        <Group justify="center">
          <Button onClick={() => navigate(paths.auth.register)}>
            Back to Register
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
