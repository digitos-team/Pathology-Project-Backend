const debug = async () => {
    try {
        const { app } = await import("./src/app.js");

        console.log("--- Inspecting Routes ---");

        if (app && app._router && app._router.stack) {
            app._router.stack.forEach((layer) => {
                if (layer.name === 'router') {
                    let pathRegex = "unknown";
                    if (layer.regexp) {
                        pathRegex = layer.regexp.toString();
                    }

                    // Check for testReport routes
                    if (pathRegex.includes("tests") || pathRegex.includes("patient")) {
                        console.log(`\nFound Router matching regex: ${pathRegex}`);

                        // Try to decode path parameter for clearer output
                        // e.g., /^\/api\/tests\/?(?=\/|$)/i

                        if (layer.handle && layer.handle.stack) {
                            layer.handle.stack.forEach(r => {
                                if (r.route) {
                                    const methods = Object.keys(r.route.methods).join(", ").toUpperCase();
                                    console.log(`  - ${methods} ${r.route.path}`);
                                }
                            });
                        }
                    }
                }
            });
        } else {
            console.log("Could not access app._router.stack - app might not be exported correctly.");
            console.log("App keys:", Object.keys(app || {}));
        }

    } catch (e) {
        console.error("Debug Error:", e);
    }
};

debug();
