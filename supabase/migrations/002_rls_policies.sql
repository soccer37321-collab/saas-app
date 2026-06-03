-- organizations: ownerのみ削除可
CREATE POLICY "orgs_delete_owner" ON public.organizations FOR DELETE
  USING (owner_id = auth.uid());

-- memberships: 組織のowner/adminのみメンバーを追加可
CREATE POLICY "memberships_insert_admin" ON public.memberships FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- memberships: 組織のowner/adminのみroleを変更可
CREATE POLICY "memberships_update_admin" ON public.memberships FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- memberships: owner/adminが削除可、または本人が自分のメンバーシップを削除可（脱退）
CREATE POLICY "memberships_delete_admin_or_self" ON public.memberships FOR DELETE
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
