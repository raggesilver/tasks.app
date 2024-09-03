create
or replace function delete_assignees_on_collaborator_removal () returns trigger as $$
begin
  delete from assignees 
  where user_id = OLD.user_id
  and task_id in (select id from tasks where workspace_id = OLD.workspace_id);
  return OLD;
end;
$$ language plpgsql;

--> statement-breakpoint
create trigger remove_assignees_on_collaborator_removal
after delete on collaborators for each row
execute function delete_assignees_on_collaborator_removal ();
