using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StockTracker.Data;
using StockTracker.Hubs;

namespace StockTracker
{
    public class Startup
    {

        public static string connectionString =
    @"data source=host.docker.internal,5434;initial catalog=master;Trusted_Connection=false;User Id=SA; Password=Pass@word; database=StockTrakerDB";


        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.AddControllersWithViews();

            // Connection to the database 
            services.AddDbContextPool<AppDBContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<AppDBContext>();
           

            services.AddControllersWithViews().AddNewtonsoftJson(options => 
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            );

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            // this is to bypass the "'http://localhost:3000' has been blocked by CORS policy" error
            services.AddCors(opt =>
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    // this should be removed on production because the clinet app will come from the same domain of the api 
                    policy
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials() // add this to enable websocket
                    .WithOrigins("http://localhost:3000"); 
                });
            });

            // to enable SignalR in the application
            services.AddSignalR();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseCors("CorsPolicy"); 

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");

                // map incoming requests to our hub
                endpoints.MapHub<DataHub>("/data");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    /*spa.UseReactDevelopmentServer(npmScript: "start");*/
                    spa.UseProxyToSpaDevelopmentServer("http://192.168.56.1:3000");
                }
            });


        }
    }
}