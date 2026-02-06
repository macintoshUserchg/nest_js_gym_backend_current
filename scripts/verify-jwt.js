const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZmFjOGJjYi0yOWExLTQ5MTEtOWVhNi0yMzExY2VmNGVhMWQiLCJlbWFpbCI6InN1cGVyYWRtaW5AZml0bmVzc2ZpcnN0ZWxpdGUuY29tIiwicm9sZSI6eyJpZCI6IjVjNTNjYzAyLTljMjUtNDg4Ni1hOTlhLWUzOTQzY2FkZDA5NSIsIm5hbWUiOiJTVVBFUkFETUlOIiwiZGVzY3JpcHRpb24iOiJTeXN0ZW0gU3VwZXIgQWRtaW5pc3RyYXRvciJ9LCJpYXQiOjE3NzAzNDM2NDUsImV4cCI6MTc3MDQzMDA0NX0.J6uaakqDO693k1ihpo4dIGR8Xw711D3_m7UKf6ls3p8";
const parts = token.split('.');
console.log('JWT Structure:');
console.log('Header:', JSON.parse(Buffer.from(parts[0], 'base64').toString()));
console.log('Payload:', JSON.parse(Buffer.from(parts[1], 'base64').toString()));
