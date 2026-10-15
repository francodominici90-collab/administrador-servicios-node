export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message
        }))
      });
    }

    // Conserva los datos procesados por Zod.
    req.validated ??= {};
    req.validated[source] = result.data;

    return next();
  };
}