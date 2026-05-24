import sys

with open("src/app/api/admin/auth/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace cookies().set with (await cookies()).set
content = content.replace("cookies().set", "(await cookies()).set")

# Replace cookies().get with (await cookies()).get
content = content.replace("cookies().get", "(await cookies()).get")

# Replace cookies().delete with (await cookies()).delete
content = content.replace("cookies().delete", "(await cookies()).delete")

with open("src/app/api/admin/auth/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated route.ts")
