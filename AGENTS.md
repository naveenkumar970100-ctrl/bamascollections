<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Public content pages use separate top-level TanStack routes and shared shell components, so navigation and page metadata remain consistent.
- Customer authentication uses Cloud email/password and managed Google sign-in with one root identity listener; profiles are owned by authenticated users through RLS and automatically created on signup.
- Keep preview catalog data separate from purchasing: no ordering or prices until actual business inventory is provided.
- Define branded presentation styles in the global design system and route metadata through the shared pageHead helper.
