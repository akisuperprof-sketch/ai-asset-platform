GRANT ALL ON TABLE ceo_reports TO service_role;
GRANT ALL ON TABLE index_queue TO service_role;
GRANT ALL ON TABLE revenue_analysis TO service_role;
GRANT ALL ON TABLE internal_links TO service_role;
GRANT ALL ON TABLE growth_scores TO service_role;
GRANT ALL ON TABLE daily_ai_plans TO service_role;
GRANT ALL ON TABLE growth_engine_runs TO service_role;

GRANT ALL ON TABLE ceo_reports TO authenticated;
GRANT ALL ON TABLE index_queue TO authenticated;
GRANT ALL ON TABLE revenue_analysis TO authenticated;
GRANT ALL ON TABLE internal_links TO authenticated;
GRANT ALL ON TABLE growth_scores TO authenticated;
GRANT ALL ON TABLE daily_ai_plans TO authenticated;
GRANT ALL ON TABLE growth_engine_runs TO authenticated;
